let produtos = {};
let categorias = {};

document.addEventListener("DOMContentLoaded", () => {

  fetch("https://deisishop.pythonanywhere.com/products/")
  .then(response => response.json())
  .then(data => {
     produtos = data;
     carregarProdutos(produtos);
     atualizarCesto(); 
  })
  .catch(error => {console.error("Erro:", error);});

  fetch("https://deisishop.pythonanywhere.com/categories/")
    .then(response => response.json())
    .then(data => {
      categorias = data;
      criarFiltroCategorias(categorias);
      criarFiltroOrdenacao();
      criarFiltroPesquisa();
    })
    .catch(error => console.error("Erro ao carregar categorias:", error));

});

// Section: Filtros

const divFiltros = document.createElement("div");
divFiltros.id = "filtro-container";
divFiltros.className = "filtro-container";
// colocar os filtros logo abaixo do header (não dentro dele)
document.querySelector("header").after(divFiltros);

function criarFiltroCategorias(categorias) {
  divFiltros.classList.add("filtro-item");

  const label = document.createElement("label");
  label.setAttribute("for", "filtro-categorias");
  label.textContent = "Categoria: ";

  const select = document.createElement("select");
  select.id = "filtro-categorias";

  const opcaoTodas = document.createElement("option");
  opcaoTodas.value = "todas";
  opcaoTodas.textContent = "Todas as categorias";
  select.appendChild(opcaoTodas);

  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  select.addEventListener("change", filtrarProdutos);

  divFiltros.append(label, select);
}

function criarFiltroOrdenacao() {
  divFiltros.classList.add("filtro-item");

  const label = document.createElement("label");
  label.setAttribute("for", "filtro-ordenacao");
  label.textContent = "Preço: ";

  const select = document.createElement("select");
  select.id = "filtro-ordenacao";

  [
    { value: "padrao", text: "Padrão" },
    { value: "crescente", text: "Menor para maior" },
    { value: "decrescente", text: "Maior para menor" }
  ].forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.text;
    select.appendChild(option);
  });

  select.addEventListener("change", filtrarProdutos);

  divFiltros.append(label, select);
}

function criarFiltroPesquisa() {
  divFiltros.classList.add("filtro-item");

  const label = document.createElement("label");
  label.setAttribute("for", "filtro-pesquisa");
  label.textContent = "Pesquisar: ";

  const input = document.createElement("input");
  input.type = "text";
  input.id = "filtro-pesquisa";
  input.placeholder = "Nome do produto...";
  input.addEventListener("input", filtrarProdutos);

  divFiltros.append(label, input);
}

// Section: Filtrar produtos
function filtrarProdutos() {
  const categoria = document.getElementById("filtro-categorias").value;
  const ordenacao = document.getElementById("filtro-ordenacao").value;
  const pesquisa = document.getElementById("filtro-pesquisa").value.toLowerCase();

  // Filtrar por categoria
  let produtosFiltrados = produtos.filter(p => {
    return (categoria === "todas" || p.category === categoria);
  });

  // Filtrar por pesquisa de nome
  produtosFiltrados = produtosFiltrados.filter(p =>
    p.title.toLowerCase().includes(pesquisa)
  );

  // Ordenar
  if (ordenacao === "crescente") {
    produtosFiltrados.sort((a, b) => a.price - b.price);
  } else if (ordenacao === "decrescente") {
    produtosFiltrados.sort((a, b) => b.price - a.price);
  }

  // Atualizar lista
  carregarProdutos(produtosFiltrados);
}

// Section: Gestão dos produtos
function carregarProdutos(produtos) {
  const container = document.getElementById("produtos");
  container.innerHTML = ""; // limpar antes de carregar

  produtos.forEach(produto => {
    const artigo = criarProduto(produto);
    container.appendChild(artigo);
  });
}

function criarProduto(produto) {
  const artigo = document.createElement("article");

  const img = document.createElement("img");
  img.src = produto.image;
  img.alt = produto.title;

  const titulo = document.createElement("h3");
  titulo.textContent = produto.title;

  const preco = document.createElement("p");
  preco.innerHTML = `<strong>${produto.price.toFixed(2)} €</strong>`;

  const descricao = document.createElement("p");
  descricao.textContent = produto.description;

  const botao = document.createElement("button");
  botao.textContent = "+ Adicionar ao cesto";
  botao.addEventListener("click", () => adicionarAoCesto(produto));

  artigo.append(img, titulo, preco, descricao, botao);

  return artigo;
}

// Section: Gestão do cesto

// Section: LocalStorage helpers
function obterCesto() {
  return JSON.parse(localStorage.getItem("cesto")) || [];
}

// Section: LocalStorage helpers
function guardarCesto(cesto) {
  localStorage.setItem("cesto", JSON.stringify(cesto));
}

// Section: Adicionar ao cesto
function adicionarAoCesto(produto) {
  const cesto = obterCesto();
  // verificar se existe; se existir incrementa quantity, senão adiciona com quantity=1
  const existente = cesto.find(p => p.id === produto.id);
  if (existente) {
    existente.quantity = (existente.quantity || 1) + 1;
  } else {
    // armazenar apenas campos essenciais para poupar espaço
    const minimo = {
      id: produto.id,
      title: produto.title,
      price: produto.price,
      image: produto.image,
      quantity: 1
    };
    cesto.push(minimo);
  }
  guardarCesto(cesto);
  atualizarCesto();
}

// Section: Renderizar cesto
function atualizarCesto() {
  const cesto = obterCesto();
  const secaoCesto = document.getElementById("cesto");

  secaoCesto.innerHTML = "<h2>Produtos Selecionados</h2>";

  if (cesto.length === 0) {
    secaoCesto.innerHTML += "<p>O teu cesto está vazio.</p>";
    return;
  }

  // Section: Renderizar cesto
  const containerItems = document.createElement("div");
  containerItems.className = "cesto-items";
  let total = 0;

  cesto.forEach(produto => {
    const artigo = document.createElement("article");
    // reaproveita estilos de `article` para manter o mesmo visual
    artigo.className = "cesto-article";

    const img = document.createElement("img");
    img.src = produto.image || "images/placeholder.png";
    img.alt = produto.title || "produto";

    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    const preco = document.createElement("p");
    const qty = produto.quantity || 1;
    preco.innerHTML = `<strong>${produto.price.toFixed(2)} €</strong> <span class="cesto-qty">x${qty}</span>`;

  // Section: Remoção de unidades
    const removerBtn = document.createElement("button");
    removerBtn.className = "cesto-remove btn";
    removerBtn.textContent = "Remover";
    removerBtn.addEventListener("click", () => {
      const atual = obterCesto();
      const item = atual.find(p => p.id === produto.id);
      if (item) {
        item.quantity = (item.quantity || 1) - 1;
        if (item.quantity <= 0) {
          const novo = atual.filter(p => p.id !== produto.id);
          guardarCesto(novo);
        } else {
          guardarCesto(atual);
        }
        atualizarCesto();
      }
    });

    artigo.append(img, titulo, preco, removerBtn);
    containerItems.appendChild(artigo);
    total += (produto.price * (produto.quantity || 1));
  });

  const totalEl = document.createElement("p");
  totalEl.className = "cesto-total";
  totalEl.innerHTML = `<strong>Total: ${total.toFixed(2)} €</strong>`;

  secaoCesto.append(containerItems, totalEl);
  // Section: Descontos (estudante)
  const descontoDiv = document.createElement("div");
  descontoDiv.className = "cesto-discount";
  const descontoCheckbox = document.createElement("input");
  descontoCheckbox.type = "checkbox";
  descontoCheckbox.id = "desconto-estudante";
  // ler estado guardado (se existir)
  const descontoSaved = JSON.parse(localStorage.getItem("descontoEstudante") || "false");
  descontoCheckbox.checked = !!descontoSaved;
  const descontoLabel = document.createElement("label");
  descontoLabel.setAttribute("for", "desconto-estudante");
  descontoLabel.textContent = "És estudante do DEISI?";

  descontoDiv.append(descontoCheckbox, descontoLabel);
  secaoCesto.appendChild(descontoDiv);

  // Section: Totais e descontos
  const totalDescontoEl = document.createElement("p");
  totalDescontoEl.className = "cesto-total-desconto";
  function atualizarTotaisComDesconto() {
    const aplicar = document.getElementById("desconto-estudante")?.checked;
    localStorage.setItem("descontoEstudante", JSON.stringify(!!aplicar));
    // coupon
    const savedCoupon = (localStorage.getItem("couponCode") || "").toLowerCase();
    const couponValid = savedCoupon === "black-friday";
    // aplicar ambos multiplicativamente
    const afterStudent = aplicar ? total * 0.75 : total;
    const afterBoth = couponValid ? afterStudent * 0.9 : afterStudent;

    // construir linhas informativas
    let lines = [];
    if (aplicar) lines.push(`<span>Desconto estudante (25%): -</span>`);
    if (couponValid) lines.push(`<span>Cupão 'black-friday' (10%): -</span>`);
    if (lines.length > 0) {
      totalDescontoEl.innerHTML = `<strong>Total final: ${afterBoth.toFixed(2)} €</strong>`;
    } else {
      totalDescontoEl.innerHTML = "";
    }
  }
  // inicializa e adiciona listener
  atualizarTotaisComDesconto();
  descontoCheckbox.addEventListener("change", atualizarTotaisComDesconto);

  secaoCesto.appendChild(totalDescontoEl);

  // Section: Cupão de desconto
  const couponDiv = document.createElement("div");
  couponDiv.className = "cesto-coupon";
  const couponLabel = document.createElement("label");
  couponLabel.textContent = "Cupão de desconto:";
  couponLabel.setAttribute("for", "coupon-input");
  const couponInput = document.createElement("input");
  couponInput.type = "text";
  couponInput.id = "coupon-input";
  couponInput.placeholder = "Insira o código...";
  const couponBtn = document.createElement("button");
  couponBtn.type = "button";
  couponBtn.textContent = "Aplicar";
  couponBtn.className = "btn";
  const couponMsg = document.createElement("span");
  couponMsg.className = "coupon-message";
  // preencher valor salvo
  const saved = localStorage.getItem("couponCode") || "";
  couponInput.value = saved;

  couponBtn.addEventListener("click", () => {
    const code = (couponInput.value || "").trim().toLowerCase();
    if (code === "black-friday") {
      localStorage.setItem("couponCode", code);
      couponMsg.textContent = "Cupão aplicado: 10%";
      couponMsg.style.color = "#d4f0d4";
    } else if (code === "") {
      localStorage.removeItem("couponCode");
      couponMsg.textContent = "Cupão removido.";
      couponMsg.style.color = "#fff";
    } else {
      localStorage.removeItem("couponCode");
      couponMsg.textContent = "Cupão inválido.";
      couponMsg.style.color = "#ffd2d2";
    }
    atualizarTotaisComDesconto();
  });

  couponDiv.append(couponLabel, couponInput, couponBtn, couponMsg);
  secaoCesto.appendChild(couponDiv);
  // Section: Ações do cesto
  const limparBtn = document.createElement("button");
  limparBtn.className = "btn btn-clear";
  limparBtn.textContent = "Limpar cesto";
  limparBtn.addEventListener("click", () => {
    localStorage.removeItem("cesto");
    atualizarCesto();
  });

  // Section: Botões de ação
  const comprarBtn = document.createElement("button");
  comprarBtn.className = "btn btn-buy";
  comprarBtn.textContent = "Comprar 🛒";
  comprarBtn.addEventListener("click", () => {
    // Exibe a seção de checkout diretamente na mesma página
    mostrarCheckout(cesto, total);
  });

  const botoesDiv = document.createElement("div");
  botoesDiv.className = "cesto-buttons";
  botoesDiv.append(limparBtn, comprarBtn);

  secaoCesto.appendChild(botoesDiv);
}

// Section: Checkout
function mostrarCheckout(cesto, total) {
  // Obter ou criar a seção de checkout (usar classes CSS em vez de estilos inline)
  let checkoutSection = document.getElementById("checkout");
  if (!checkoutSection) {
    checkoutSection = document.createElement("section");
    checkoutSection.id = "checkout";
    checkoutSection.className = "checkout-section";
    document.body.appendChild(checkoutSection);
  }

  // Limpa e reconstrói o conteúdo do checkout (permite atualização)
  checkoutSection.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.textContent = "Resumo do Pedido";
  checkoutSection.appendChild(h2);

  const listaCheckout = document.createElement("ul");
  listaCheckout.className = "checkout-list";

  cesto.forEach(produto => {
    const itemCheckout = document.createElement("li");
    itemCheckout.className = "checkout-item";

    const img = document.createElement("img");
    img.src = produto.image || "images/placeholder.png";
    img.alt = produto.title || "produto";
    img.className = "checkout-img";

    const info = document.createElement("span");
    info.className = "checkout-text";
    const qty = produto.quantity || 1;
    const subtotal = (produto.price * qty).toFixed(2);
    info.textContent = `${produto.title} (x${qty}) - ${subtotal} €`;

    itemCheckout.append(img, info);
    listaCheckout.appendChild(itemCheckout);
  });

  const totalCheckout = document.createElement("p");
  totalCheckout.className = "checkout-total";
  totalCheckout.innerHTML = `<strong>Total: ${total.toFixed(2)} €</strong>`;
  checkoutSection.appendChild(listaCheckout);

  // Aplicar descontos (estudante + cupão) se existirem
  const descontoAplicado = JSON.parse(localStorage.getItem("descontoEstudante") || "false");
  const savedCoupon = (localStorage.getItem("couponCode") || "").toLowerCase();
  const couponValid = savedCoupon === "black-friday";

  if (descontoAplicado || couponValid) {
    const afterStudent = descontoAplicado ? total * 0.75 : total;
    const afterBoth = couponValid ? afterStudent * 0.9 : afterStudent;

    const totalDescontoEl = document.createElement("p");
    totalDescontoEl.className = "checkout-total";
    totalDescontoEl.innerHTML = `<strong>Total com desconto: ${afterBoth.toFixed(2)} €</strong>`;

    // Mostrar detalhes (opcional) — mostrar linhas separadas para cada desconto aplicado
    if (descontoAplicado) {
      const line = document.createElement("p");
      line.className = "checkout-total";
      line.innerHTML = `Desconto estudante (25%) aplicado`;
      checkoutSection.appendChild(line);
    }
    if (couponValid) {
      const line2 = document.createElement("p");
      line2.className = "checkout-total";
      line2.innerHTML = `Cupão 'black-friday' (10%) aplicado`;
      checkoutSection.appendChild(line2);
    }

    checkoutSection.appendChild(totalCheckout);
    checkoutSection.appendChild(totalDescontoEl);
  } else {
    checkoutSection.appendChild(totalCheckout);
  }
}
