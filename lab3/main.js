let produtos = {};                     // Variável global para os produtos (inicia como objeto; mais adequado seria array)
let categorias = {};                   // Variável global para as categorias (idem)

// Quando todo o HTML/DOM estiver pronto:
document.addEventListener("DOMContentLoaded", () => {

  // Faz pedido à API para obter a lista de produtos
  fetch("https://deisishop.pythonanywhere.com/products/")
  .then(response => response.json())   // Converte a resposta para JSON
  .then(data => {                      // Quando o JSON estiver disponível:
     produtos = data;                  // guarda os produtos na variável global
     carregarProdutos(produtos);       // renderiza os produtos no ecrã
     atualizarCesto();                 // desenha/atualiza a secção do cesto
  })
  .catch(error => {console.error("Erro:", error);}); // Se falhar, mostra erro na consola

  // Faz pedido à API para obter a lista de categorias
  fetch("https://deisishop.pythonanywhere.com/categories/")
    .then(response => response.json()) // Converte a resposta para JSON
    .then(data => {                    // Quando o JSON estiver disponível:
      categorias = data;               // guarda as categorias
      criarFiltroCategorias(categorias); // constrói o filtro de categorias
      criarFiltroOrdenacao();            // constrói o filtro de ordenação por preço
      criarFiltroPesquisa();             // constrói o filtro de pesquisa por texto
    })
    .catch(error => console.error("Erro ao carregar categorias:", error)); // Erros do fetch de categorias

}); // fim do DOMContentLoaded

// ---------- Section: Filtros ----------

// Cria o contentor dos filtros na hora do parsing (fora do DOMContentLoaded)
const divFiltros = document.createElement("div");     // cria um <div> para conter os filtros
divFiltros.id = "filtro-container";                   // define id para o CSS/seletores
divFiltros.className = "filtro-container";            // define classe(s) para estilos
// coloca os filtros logo abaixo do header (não dentro dele)
document.querySelector("header").after(divFiltros);   // insere o div a seguir ao <header>

// Botão global para ocultar/mostrar imagens (persistido em localStorage)
// (Comentado a pedido: funcionalidade desativada temporariamente)
// const toggleImagesBtn = document.createElement('button');
// toggleImagesBtn.id = 'toggle-images';
// toggleImagesBtn.className = 'btn toggle-images';
// const hideSaved = localStorage.getItem('hideImages') === 'true';
// if (hideSaved) document.body.classList.add('hide-images');
// toggleImagesBtn.textContent = document.body.classList.contains('hide-images') ? 'Mostrar imagens' : 'Ocultar imagens';
// toggleImagesBtn.addEventListener('click', () => {
//   const hidden = document.body.classList.toggle('hide-images');
//   toggleImagesBtn.textContent = hidden ? 'Mostrar imagens' : 'Ocultar imagens';
//   localStorage.setItem('hideImages', hidden ? 'true' : 'false');
// });
// divFiltros.appendChild(toggleImagesBtn);

// Constrói o filtro de categorias (select)
function criarFiltroCategorias(categorias) {
  divFiltros.classList.add("filtro-item");            // adiciona uma classe indicativa

  const label = document.createElement("label");      // cria <label> "Categoria:"
  label.setAttribute("for", "filtro-categorias");
  label.textContent = "Categoria: ";

  const select = document.createElement("select");    // cria o <select> das categorias
  select.id = "filtro-categorias";

  const opcaoTodas = document.createElement("option");// opção "todas"
  opcaoTodas.value = "todas";
  opcaoTodas.textContent = "Todas as categorias";
  select.appendChild(opcaoTodas);                     // insere a opção "Todas"

  categorias.forEach(cat => {                         // para cada categoria recebida da API:
    const option = document.createElement("option"); // cria uma <option>
    // aceitar que a API devolva uma lista de strings ou objetos { name: ... }
    const name = (typeof cat === 'string') ? cat : (cat && (cat.name || cat.title || String(cat)));
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  select.addEventListener("change", filtrarProdutos); // quando mudar a categoria → filtra a lista

  divFiltros.append(label, select);                   // insere label e select no container de filtros
}

// Constrói o filtro de ordenação por preço
function criarFiltroOrdenacao() {
  divFiltros.classList.add("filtro-item");            // marca o bloco como item de filtro

  const label = document.createElement("label");      // cria <label> "Preço:"
  label.setAttribute("for", "filtro-ordenacao");
  label.textContent = "Preço: ";

  const select = document.createElement("select");    // cria o <select> de ordenação
  select.id = "filtro-ordenacao";

  [                                                   // cria as opções do select
    { value: "padrao", text: "Padrão" },
    { value: "crescente", text: "Menor para maior" },
    { value: "decrescente", text: "Maior para menor" },
    // Comentário: opções para ordenar por número de avaliações (rating.rate).
    // (Comentadas a pedido)
    // { value: "rating-crescente", text: "Avaliações ↑" },
    // { value: "rating-decrescente", text: "Avaliações ↓" }
  ].forEach(opt => {
    const option = document.createElement("option");  // nova option
    option.value = opt.value;                         // value = tipo de ordenação
    option.textContent = opt.text;                    // texto visível
    select.appendChild(option);                       // adiciona ao select
  });

  select.addEventListener("change", filtrarProdutos); // ao mudar → aplica ordenação

  divFiltros.append(label, select);                   // adiciona label e select ao container
}
// Constrói o filtro de pesquisa (input de texto)
function criarFiltroPesquisa() {
  divFiltros.classList.add("filtro-item");            // marca o bloco como item de filtro

  const label = document.createElement("label");      // cria <label> "Pesquisar:"
  label.setAttribute("for", "filtro-pesquisa");
  label.textContent = "Pesquisar: ";

  const input = document.createElement("input");      // cria <input type="text">
  input.type = "text";
  input.id = "filtro-pesquisa";
  input.placeholder = "Nome do produto...";           // placeholder para orientar o utilizador
  input.addEventListener("input", filtrarProdutos);   // a cada tecla → filtra

  divFiltros.append(label, input);                    // adiciona label e input ao container
}

// ---------- Section: Filtrar produtos ----------
function filtrarProdutos() {
  const categoria = document.getElementById("filtro-categorias").value; // lê categoria selecionada
  const ordenacao = document.getElementById("filtro-ordenacao").value;  // lê ordenação selecionada
  const pesquisa = document.getElementById("filtro-pesquisa").value.toLowerCase(); // lê texto de pesquisa

  // Filtrar por categoria (suporta product.category como string ou object {name:...})
  let produtosFiltrados = produtos.filter(p => {
    if (categoria === "todas") return true;
    const prodCat = p.category;
    const prodCatName = (typeof prodCat === 'string') ? prodCat : (prodCat && (prodCat.name || prodCat.title || String(prodCat)));
    return prodCatName === categoria;
  });

  // Filtrar por pesquisa de nome
  produtosFiltrados = produtosFiltrados.filter(p =>   // filtra mais pelo texto no título
    p.title.toLowerCase().includes(pesquisa)          // inclui se o título contiver o texto pesquisado
  );

  // Ordenar
    if (ordenacao === "crescente") {                    // se for ordem crescente por preço
      produtosFiltrados.sort((a, b) => a.price - b.price);
    } else if (ordenacao === "decrescente") {           // se for ordem decrescente por preço
      produtosFiltrados.sort((a, b) => b.price - a.price);
    // } else if (ordenacao === 'rating-crescente') {      // se for ordem crescente por rating
    //   // Comentário: aqui comparamos `rating.rate` (se existir) e usamos 0 como fallback.
    //   // Isto garante que produtos sem rating aparecem com rate = 0 e não causam NaN.
    //   produtosFiltrados.sort((a, b) => (a.rating?.rate || 0) - (b.rating?.rate || 0));
    // } else if (ordenacao === 'rating-decrescente') {     // se for ordem decrescente por rating
    //   // Comentário: ordenação decrescente por rating.rate; usa 0 quando não existir.
    //   produtosFiltrados.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    // }
    }

  // Atualizar lista
  carregarProdutos(produtosFiltrados);                // redesenha os produtos filtrados/ordenados
}

// ---------- Section: Gestão dos produtos ----------
function carregarProdutos(produtos) {
  const container = document.getElementById("produtos"); // obtém o contentor dos produtos
  container.innerHTML = "";                               // limpa o conteúdo anterior

  /*
    Meta: Solução - mostrar contagem total e filtrada de produtos

    Abordagem:
    - Crie um elemento visível junto ao header/lista com id `product-count`.
    - Ao chamar `carregarProdutos(produtos)` atualize esse elemento com:
        const total = (window.produtos && window.produtos.length) || produtos.length;
        const shown = produtos.length;
        document.getElementById('product-count').textContent = `Mostrando ${shown} de ${total} produtos`;
    - Assim o contador reflete tanto a pesquisa como o filtro por categoria.
  */

  // Atualizar contador de produtos (mostrando filtrados vs total disponível)
  // Comentário: aqui construímos um elemento `#product-count` que mostra
  // quantos produtos estão a ser apresentados (após filtros/pesquisa) e
  // o total geral disponível (obtido de `window.produtos`). Isto ajuda o
  // utilizador a saber quantos resultados a pesquisa/filtragem devolveu.
  const totalAll = Array.isArray(window.produtos) ? window.produtos.length : (Array.isArray(produtos) ? produtos.length : 0);
  const shown = Array.isArray(produtos) ? produtos.length : 0;
  // Elemento de contagem de produtos (Comentado a pedido: funcionalidade desativada)
  // let countEl = document.getElementById('product-count');
  // if (!countEl) {
  //   countEl = document.createElement('div');
  //   countEl.id = 'product-count';
  //   countEl.className = 'product-count';
  //   divFiltros.appendChild(countEl);
  // }
  // countEl.textContent = `Mostrando ${shown} de ${totalAll} produtos`;

  produtos.forEach(produto => {                           // para cada produto do array dado:
    const artigo = criarProduto(produto);                 // cria o <article> com os dados
    container.appendChild(artigo);                        // adiciona ao DOM
  });
}

// Cria o markup de um produto individual
function criarProduto(produto) {
  const artigo = document.createElement("article");   // <article> para o produto

  const img = document.createElement("img");          // imagem do produto
  img.src = produto.image;
  img.alt = produto.title;

  const titulo = document.createElement("h3");        // título do produto
  titulo.textContent = produto.title;

  const preco = document.createElement("p");          // preço com formatação 2 casas
  preco.innerHTML = `<strong>${produto.price.toFixed(2)} €</strong>`;

  const descricao = document.createElement("p");      // descrição do produto
  descricao.textContent = produto.description;

  const botao = document.createElement("button");     // botão para adicionar ao cesto
  botao.textContent = "+ Adicionar ao cesto";
  botao.addEventListener("click", () => adicionarAoCesto(produto)); // ao clicar → adiciona

  /*
    Meta: Solução - botão "ocultar imagens" global

    Implementação sugerida:
    - Crie um botão fora dos artigos (ex.: no header) com id `toggle-images`.
    - Ao clicar, togglear uma classe no body (ex.: `hide-images`).
    - No CSS: `.hide-images article img { display: none; }`.
    - Atualize o texto do botão conforme o estado:
        const btn = document.getElementById('toggle-images');
        btn.addEventListener('click', () => {
          document.body.classList.toggle('hide-images');
          btn.textContent = document.body.classList.contains('hide-images') ? 'Mostrar imagens' : 'Ocultar imagens';
        });
    - Dessa forma todos os `<img>` dos produtos são escondidos/mostrados sem alterar o markup dos artigos.
  */

  artigo.append(img, titulo, preco, descricao, botao); // junta tudo ao article

  return artigo;                                     // devolve o nó para ser inserido
}

// ---------- Section: Gestão do cesto ----------

// ---------- Section: LocalStorage helpers ----------
function obterCesto() {
  return JSON.parse(localStorage.getItem("cesto")) || []; // lê o cesto do localStorage (ou [] se não existir)
}
function guardarCesto(cesto) {
  localStorage.setItem("cesto", JSON.stringify(cesto));   // grava o cesto no localStorage
}

// ---------- Section: Adicionar ao cesto ----------
function adicionarAoCesto(produto) {
  const cesto = obterCesto();                             // lê o cesto atual
  // verificar se existe; se existir incrementa quantity, senão adiciona com quantity=1
  const existente = cesto.find(p => p.id === produto.id); // procura se já há o produto no cesto
  if (existente) {                                        // se já existe:
    existente.quantity = (existente.quantity || 1) + 1;   // incrementa a quantidade
  } else {
    // armazenar apenas campos essenciais para poupar espaço
    const minimo = {                                      // objeto mínimo para guardar
      id: produto.id,
      title: produto.title,
      price: produto.price,
      image: produto.image,
      quantity: 1
    };
    cesto.push(minimo);                                   // adiciona ao cesto
  }
  guardarCesto(cesto);                                    // persiste
  atualizarCesto();                                       // redesenha a secção do cesto
}

// ---------- Section: Renderizar cesto ----------
function atualizarCesto() {
  const cesto = obterCesto();                             // lê cesto atual
  const secaoCesto = document.getElementById("cesto");    // contentor da secção de cesto

  secaoCesto.innerHTML = "<h2>Produtos Selecionados</h2>"; // título de secção

  if (cesto.length === 0) {                               // se estiver vazio:
    secaoCesto.innerHTML += "<p>O teu cesto está vazio.</p>"; // mostra mensagem
    return;                                               // sai da função
  }

  const containerItems = document.createElement("div");   // contentor para os items
  containerItems.className = "cesto-items";
  let total = 0;                                          // acumulador do total bruto

  cesto.forEach(produto => {                              // para cada produto no cesto:
    const artigo = document.createElement("article");     // usa <article> para cada linha
    // reaproveita estilos de `article` para manter o mesmo visual
    artigo.className = "cesto-article";

    const img = document.createElement("img");            // imagem do produto
    img.src = produto.image || "images/placeholder.png";  // fallback se não houver imagem
    img.alt = produto.title || "produto";

    const titulo = document.createElement("h3");          // título do produto
    titulo.textContent = produto.title;

    const preco = document.createElement("p");            // preço + quantidade
    const qty = produto.quantity || 1;
    preco.innerHTML = `<strong>${produto.price.toFixed(2)} €</strong> <span class="cesto-qty">x${qty}</span>`;

    // ---------- Section: Remoção de unidades ----------
    const removerBtn = document.createElement("button");  // botão remover 1 unidade
    removerBtn.className = "cesto-remove btn";
    removerBtn.textContent = "Remover";
    removerBtn.addEventListener("click", () => {          // ao clicar:
      const atual = obterCesto();                         // lê outra vez (estado atual)
      const item = atual.find(p => p.id === produto.id);  // encontra o produto
      if (item) {
        item.quantity = (item.quantity || 1) - 1;         // decrementa quantidade
        if (item.quantity <= 0) {                         // se foi a zero:
          const novo = atual.filter(p => p.id !== produto.id); // remove do array
          guardarCesto(novo);                             // persiste sem o item
        } else {
          guardarCesto(atual);                            // persiste com qty atualizada
        }
        atualizarCesto();                                 // redesenha a secção
      }
    });

    artigo.append(img, titulo, preco, removerBtn);        // monta o artigo
    containerItems.appendChild(artigo);                   // adiciona à lista
    total += (produto.price * (produto.quantity || 1));   // acumula o total bruto
  });

  const totalEl = document.createElement("p");            // mostra total bruto
  totalEl.className = "cesto-total";
  totalEl.innerHTML = `<strong>Total: ${total.toFixed(2)} €</strong>`;

  secaoCesto.append(containerItems, totalEl);             // coloca lista e total na secção

  // ---------- Section: Descontos (estudante) ----------
  const descontoDiv = document.createElement("div");      // bloco do checkbox estudante
  descontoDiv.className = "cesto-discount";
  const descontoCheckbox = document.createElement("input");
  descontoCheckbox.type = "checkbox";
  descontoCheckbox.id = "desconto-estudante";
  // ler estado guardado (se existir)
  const descontoSaved = JSON.parse(localStorage.getItem("descontoEstudante") || "false");
  descontoCheckbox.checked = !!descontoSaved;             // marca conforme guardado
  const descontoLabel = document.createElement("label");
  descontoLabel.setAttribute("for", "desconto-estudante");
  descontoLabel.textContent = "És estudante do DEISI?";

  descontoDiv.append(descontoCheckbox, descontoLabel);    // junta checkbox + label
  secaoCesto.appendChild(descontoDiv);                    // insere na secção

  // ---------- Section: Totais e descontos ----------
  const totalDescontoEl = document.createElement("p");    // parágrafo para total com desconto
  totalDescontoEl.className = "cesto-total-desconto";
  function atualizarTotaisComDesconto() {                 // função que recalcula descontos
    const aplicar = document.getElementById("desconto-estudante")?.checked; // está marcado?
    localStorage.setItem("descontoEstudante", JSON.stringify(!!aplicar));   // guarda estado
    // coupon
    const savedCoupon = (localStorage.getItem("couponCode") || "").toLowerCase(); // lê cupão guardado
    const couponValid = savedCoupon === "black-friday";   // cupão válido?
    // aplicar ambos multiplicativamente
    const afterStudent = aplicar ? total * 0.75 : total;  // -25% se estudante
    const afterBoth = couponValid ? afterStudent * 0.9 : afterStudent; // -10% se cupão

    // construir linhas informativas
    let lines = [];
    if (aplicar) lines.push(`<span>Desconto estudante (25%): -</span>`);
    if (couponValid) lines.push(`<span>Cupão 'black-friday' (10%): -</span>`);
    if (lines.length > 0) {
      totalDescontoEl.innerHTML = `<strong>Total final: ${afterBoth.toFixed(2)} €</strong>`; // mostra total com descontos
    } else {
      totalDescontoEl.innerHTML = "";                    // sem descontos, não mostra nada aqui
    }
  }
  // inicializa e adiciona listener
  atualizarTotaisComDesconto();                           // calcula logo à partida
  descontoCheckbox.addEventListener("change", atualizarTotaisComDesconto); // recalcula ao clicar

  secaoCesto.appendChild(totalDescontoEl);                // insere o total com desconto (se existir)

  // ---------- Section: Cupão de desconto ----------
  const couponDiv = document.createElement("div");        // bloco do cupão
  couponDiv.className = "cesto-coupon";
  const couponLabel = document.createElement("label");
  couponLabel.textContent = "Cupão de desconto:";
  couponLabel.setAttribute("for", "coupon-input");
  const couponInput = document.createElement("input");    // input do código do cupão
  couponInput.type = "text";
  couponInput.id = "coupon-input";
  couponInput.placeholder = "Insira o código...";
  const couponBtn = document.createElement("button");     // botão "Aplicar"
  couponBtn.type = "button";
  couponBtn.textContent = "Aplicar";
  couponBtn.className = "btn";
  const couponMsg = document.createElement("span");       // mensagem de feedback
  couponMsg.className = "coupon-message";
  // preencher valor salvo
  const saved = localStorage.getItem("couponCode") || ""; // se já havia cupão guardado, preenche
  couponInput.value = saved;

  couponBtn.addEventListener("click", () => {             // ao clicar em "Aplicar":
    const code = (couponInput.value || "").trim().toLowerCase(); // normaliza
    if (code === "black-friday") {                        // se for válido:
      localStorage.setItem("couponCode", code);           // guarda
      couponMsg.textContent = "Cupão aplicado: 10%";      // feedback positivo
      couponMsg.style.color = "#d4f0d4";
    } else if (code === "") {                             // se vazio, remove cupão
      localStorage.removeItem("couponCode");
      couponMsg.textContent = "Cupão removido.";
      couponMsg.style.color = "#fff";
    } else {                                              // inválido
      localStorage.removeItem("couponCode");
      couponMsg.textContent = "Cupão inválido.";
      couponMsg.style.color = "#ffd2d2";
    }
    atualizarTotaisComDesconto();                         // recalcula total com base no novo estado
  });

  couponDiv.append(couponLabel, couponInput, couponBtn, couponMsg); // junta tudo
  secaoCesto.appendChild(couponDiv);                      // insere na secção

  // ---------- Section: Ações do cesto ----------
  const limparBtn = document.createElement("button");     // botão "Limpar cesto"
  limparBtn.className = "btn btn-clear";
  limparBtn.textContent = "Limpar cesto";
  limparBtn.addEventListener("click", () => {             // ao clicar:
    localStorage.removeItem("cesto");                     // apaga o cesto do storage
    atualizarCesto();                                     // redesenha a secção (mostrará vazio)
  });

  // ---------- Section: Botões de ação ----------
  const comprarBtn = document.createElement("button");    // botão "Comprar"
  comprarBtn.className = "btn btn-buy";
  comprarBtn.textContent = "Comprar 🛒";
  comprarBtn.addEventListener("click", () => {            // ao clicar:
    // Envia pedido ao endpoint /buy e mostra referência e total retornado
    finalizarCompra(cesto, total);                        // inicia o fluxo de compra
  });

  const botoesDiv = document.createElement("div");        // contentor dos dois botões
  botoesDiv.className = "cesto-buttons";
  botoesDiv.append(limparBtn, comprarBtn);                // junta os botões

  secaoCesto.appendChild(botoesDiv);                      // insere os botões na secção do cesto
}

// ---------- Section: Checkout ----------
function mostrarCheckout(cesto, total) {
  // Obter ou criar a seção de checkout (usar classes CSS em vez de estilos inline)
  let checkoutSection = document.getElementById("checkout"); // tenta obter secção existente
  if (!checkoutSection) {                                     // se não existir:
    checkoutSection = document.createElement("section");      // cria nova
    checkoutSection.id = "checkout";
    checkoutSection.className = "checkout-section";
    document.body.appendChild(checkoutSection);               // insere no body
  }

  // Limpa e reconstrói o conteúdo do checkout (permite atualização)
  checkoutSection.innerHTML = "";                             // limpa a secção
  const h2 = document.createElement("h2");                    // título "Resumo do Pedido"
  h2.textContent = "Resumo do Pedido";
  checkoutSection.appendChild(h2);                            // insere título

  const listaCheckout = document.createElement("ul");         // lista dos itens
  listaCheckout.className = "checkout-list";

  cesto.forEach(produto => {                                  // percorre items do cesto
    const itemCheckout = document.createElement("li");        // item da lista
    itemCheckout.className = "checkout-item";

    const img = document.createElement("img");                // imagem pequena do item
    img.src = produto.image || "images/placeholder.png";
    img.alt = produto.title || "produto";
    img.className = "checkout-img";

    const info = document.createElement("span");              // texto com nome, qty e subtotal
    info.className = "checkout-text";
    const qty = produto.quantity || 1;
    const subtotal = (produto.price * qty).toFixed(2);
    info.textContent = `${produto.title} (x${qty}) - ${subtotal} €`;

    itemCheckout.append(img, info);                           // monta o item
    listaCheckout.appendChild(itemCheckout);                  // adiciona à lista
  });

  const totalCheckout = document.createElement("p");          // total bruto
  totalCheckout.className = "checkout-total";
  totalCheckout.innerHTML = `<strong>Total: ${total.toFixed(2)} €</strong>`;
  checkoutSection.appendChild(listaCheckout);                 // insere a lista no checkout

  // Aplicar descontos (estudante + cupão) se existirem
  const descontoAplicado = JSON.parse(localStorage.getItem("descontoEstudante") || "false"); // está marcado?
  const savedCoupon = (localStorage.getItem("couponCode") || "").toLowerCase();              // lê cupão
  const couponValid = savedCoupon === "black-friday";                                        // valida

  if (descontoAplicado || couponValid) {                          // se existirem descontos:
    const afterStudent = descontoAplicado ? total * 0.75 : total; // aplica -25% se estudante
    const afterBoth = couponValid ? afterStudent * 0.9 : afterStudent; // aplica -10% se cupão

    const totalDescontoEl = document.createElement("p");          // total com descontos
    totalDescontoEl.className = "checkout-total";
    totalDescontoEl.innerHTML = `<strong>Total com desconto: ${afterBoth.toFixed(2)} €</strong>`;

    // Mostrar detalhes (opcional) — mostrar linhas separadas para cada desconto aplicado
    if (descontoAplicado) {                                       // linha informativa estudante
      const line = document.createElement("p");
      line.className = "checkout-total";
      line.innerHTML = `Desconto estudante (25%) aplicado`;
      checkoutSection.appendChild(line);
    }
    if (couponValid) {                                            // linha informativa cupão
      const line2 = document.createElement("p");
      line2.className = "checkout-total";
      line2.innerHTML = `Cupão 'black-friday' (10%) aplicado`;
      checkoutSection.appendChild(line2);
    }

    checkoutSection.appendChild(totalCheckout);                   // mostra total bruto
    checkoutSection.appendChild(totalDescontoEl);                 // mostra total com desconto
  } else {
    checkoutSection.appendChild(totalCheckout);                   // sem descontos, só total bruto
  }
}

// ---------- Section: Finalizar compra (POST /buy) ----------
async function finalizarCompra(cesto, total) {
  // calcular descontos
  const descontoAplicado = JSON.parse(localStorage.getItem("descontoEstudante") || "false"); // lê estado estudante
  const savedCoupon = (localStorage.getItem("couponCode") || "").toLowerCase();              // cupão guardado
  const couponValid = savedCoupon === "black-friday";                                        // é válido?
  const afterStudent = descontoAplicado ? total * 0.75 : total;                              // aplica -25%
  const finalTotal = couponValid ? afterStudent * 0.9 : afterStudent;                        // aplica -10%

  // Preparar payload conforme schema esperado pela API:
  // { products: [1,2,2], student: true, coupon: 'black-friday', name: 'Nome' }
  // Construir array de ids repetidos pela quantidade (se quantity=2 => id aparece 2x)
  const productsList = [];
  cesto.forEach(p => {
    const qty = p.quantity || 1;
    for (let i = 0; i < qty; i++) productsList.push(p.id);
  });

  // Pedir ao utilizador o nome para a encomenda (campo exigido pela API)
  const buyerName = window.prompt('Nome para a encomenda (ex.: Maria Lisboa):', '')?.trim();
  if (!buyerName) {
    alert('É necessário indicar o nome do cliente para a encomenda.');
    return;
  }

  const payload = {
    products: productsList,
    student: !!descontoAplicado,
    coupon: couponValid ? savedCoupon : null,
    name: buyerName
  };

  // mostrar checkout imediatamente e exibir referência local
  mostrarCheckout(cesto, total);                                                             // mostra resumo ao utilizador

  // validar antes de enviar
  if (!payload.products || payload.products.length === 0) {
    console.warn('Não enviar /buy — products vazio', payload);
    alert('O cesto está vazio. Adicione produtos antes de finalizar a compra.');
    return;
  }

  // limpar mensagens anteriores na área de checkout
  const checkoutSection = document.getElementById("checkout");
  const prevErr = document.getElementById('payment-error');
  if (prevErr) prevErr.remove();
  const prevMsg = document.getElementById('payment-message');
  if (prevMsg) prevMsg.remove();
  const prevRef = document.getElementById('payment-reference');
  if (prevRef) prevRef.remove();

  console.log('Enviando payload /buy:', payload);

  try {
    const resp = await fetch("https://deisishop.pythonanywhere.com/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
    console.log('Resposta /buy:', resp.status, data);

    if (!resp.ok) {
      const errMsg = (data && (data.message || data.error)) || text || `HTTP ${resp.status}`;
      let errEl = document.getElementById('payment-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.id = 'payment-error';
        errEl.style.color = 'red';
      }
      errEl.textContent = `Erro ao processar pagamento: ${errMsg}`;
      checkoutSection.appendChild(errEl);
      return;
    }

    // sucesso: usar referência e total retornados pela API
    const serverRef = data && (data.reference || data.ref);
    const serverTotal = data && (data.totalCost || data.total || data.amount || data.paid);
    const serverMsg = data && (data.example || data.message || data.msg);

    // referência — prefer the exact phrase returned by the server if present
    // the API may include a full sentence like "Referência para pagamento: 061125-22217"
    const refCandidates = [
      data && data.reference,
      data && data.ref,
      data && data.example,
      data && data.message,
      data && data.msg,
      data && data.raw
    ];
    let serverRefText = '';
    const refRegex = /Refer[eê]ncia para pagamento[:\s]*[0-9-]+/i;
    for (const cand of refCandidates) {
      if (!cand) continue;
      if (typeof cand === 'string') {
        const m = cand.match(refRegex);
        if (m) { serverRefText = m[0]; break; }
      }
    }
    // fallback: if server returned a simple reference field, format it
    if (!serverRefText) {
      const simpleRef = data && (data.reference || data.ref);
      if (simpleRef) serverRefText = `Referência para pagamento: ${simpleRef}`;
      else serverRefText = 'Referência para pagamento: N/A';
    }

    const refEl = document.createElement("p");
    refEl.id = "payment-reference";
    refEl.innerHTML = `<strong>${serverRefText}</strong>`;
    checkoutSection.appendChild(refEl);

    // mostrar mensagem do servidor (ex.: data.example when it's not the reference)
    if (serverMsg && (!serverMsg.includes(serverRefText))) {
      let msgEl = document.getElementById('payment-message');
      if (!msgEl) {
        msgEl = document.createElement('p');
        msgEl.id = 'payment-message';
      }
      msgEl.textContent = serverMsg;
      checkoutSection.appendChild(msgEl);
    }

    // total retornado pelo servidor (preferir totalCost)
    const totalValue = serverTotal !== undefined ? Number(serverTotal) : Number(finalTotal.toFixed(2));
    const totalEl = document.createElement("p");
    totalEl.id = "payment-total";
    totalEl.innerHTML = `<strong>Total cobrado: ${Number(totalValue).toFixed(2)} €</strong>`;
    checkoutSection.appendChild(totalEl);
  } catch (err) {
    console.error('Erro ao contactar /buy:', err);
    let errEl = document.getElementById('payment-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.id = 'payment-error';
      errEl.style.color = 'red';
    }
    errEl.textContent = `Erro ao contactar o servidor: ${err.message || err}`;
    checkoutSection.appendChild(errEl);
    alert('Ocorreu um erro ao finalizar a compra. Tente novamente.');
  }
}

// ---------- Section: Payment reference generator ----------
function generatePaymentReference() {
  // Prefix dynamic using current date YYMMDD
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${yy}${mm}${dd}`;                                                           // dynamic YYMMDD
  const storageKey = `paymentSeq_${dateKey}`;                                                  // chave para o contador diário
  let seq = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;                         // incrementa sequência
  localStorage.setItem(storageKey, String(seq));                                               // guarda novo valor
  const seqStr = String(seq).padStart(4, '0');                                                 // 4 dígitos com zeros à esquerda
  return `${dateKey}-${seqStr}`;                                                                // YYMMDD-XXXX
}