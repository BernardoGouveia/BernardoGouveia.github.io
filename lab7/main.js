
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos(produtos);
});

/** Recebe a lista de produtos, escreve cada produto na consola (objeto completo, depois id e title)
 * cria o <article> de cada produto e adiciona-o à secção #produtos */
function carregarProdutos(lista) {
  const secProdutos = document.getElementById('produtos');
  if (!secProdutos) {
    console.error('Elemento #produtos não encontrado no DOM.');
    return;
  }

  // Limpar antes de renderizar (útil em futuras atualizações)
  secProdutos.textContent = '';

  lista.forEach((produto) => {
    // imprime o objeto completo
    console.log(produto);
    //imprime campos específicos
    console.log('ID:', produto.id, 'Title:', produto.title);

    //cria e insere o <article>
    const artigo = criarProduto(produto);
    secProdutos.append(artigo);
  });
}

function criarProduto(produto) {
  const artigo = document.createElement('article');
  artigo.setAttribute('data-id', produto.id);

  // Header com título
  const header = document.createElement('header');
  const titulo = document.createElement('h3');
  titulo.textContent = produto.title;
  header.append(titulo);

  // Imagem com figure/figcaption
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = produto.image;
  img.alt = produto.title;
  img.width = 180;
  const figcaption = document.createElement('figcaption');
  figcaption.textContent = produto.category;
  figure.append(img, figcaption);

  // Descrição
  const paragrafoDesc = document.createElement('p');
  paragrafoDesc.className = 'descricao';
  paragrafoDesc.textContent = produto.description;

  // Preço
  const paragrafoPreco = document.createElement('p');
  paragrafoPreco.className = 'preco';
  const preco = document.createElement('strong');
  preco.textContent = `${produto.price.toFixed(2)} €`;
  paragrafoPreco.append(preco);

  // Footer com botão
  const footer = document.createElement('footer');
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = 'Adicionar ao cesto';
  botao.setAttribute('aria-label', `Adicionar ${produto.title} ao cesto`);
  botao.dataset.id = produto.id;
  botao.addEventListener('click', () => adicionarAoCesto(produto)); // Chama a função para adicionar o produto ao cesto
  footer.append(botao);

  // Montagem final do <article>
  artigo.append(header, figure, paragrafoDesc, paragrafoPreco, footer);

  return artigo;
}

/** Função para adicionar produto ao cesto */
function adicionarAoCesto(produto) {
  const cesto = JSON.parse(localStorage.getItem('cesto')) || [];
  cesto.push(produto);
  localStorage.setItem('cesto', JSON.stringify(cesto));
  atualizarCesto();
}

/** Função para remover produto do cesto */
function removerDoCesto(id) {
  let cesto = JSON.parse(localStorage.getItem('cesto')) || [];
  cesto = cesto.filter(produto => produto.id !== id);
  localStorage.setItem('cesto', JSON.stringify(cesto));
  atualizarCesto();
}

/** Função para atualizar a visualização do cesto */
function atualizarCesto() {
  const cesto = JSON.parse(localStorage.getItem('cesto')) || [];
  const secCesto = document.getElementById('cesto');
  if (!secCesto) {
    console.error('Elemento #cesto não encontrado no DOM.');
    return;
  }

  secCesto.textContent = ''; // Limpa o conteúdo antes de atualizar
  let custoTotal = 0;

  // Exibe os produtos no cesto
  cesto.forEach(produto => {
    const artigoCesto = criarProdutoCesto(produto);
    secCesto.append(artigoCesto);
    custoTotal += produto.price;
  });

  // Exibe o custo total
  const custoTotalElement = document.createElement('p');
  custoTotalElement.textContent = `Custo total: ${custoTotal.toFixed(2)} €`;
  secCesto.append(custoTotalElement);
}

/** Função para criar o artigo no cesto */
function criarProdutoCesto(produto) {
  const artigo = document.createElement('article');
  artigo.setAttribute('data-id', produto.id);

  // Header com título
  const header = document.createElement('header');
  const titulo = document.createElement('h3');
  titulo.textContent = produto.title;
  header.append(titulo);

  // Preço
  const paragrafoPreco = document.createElement('p');
  paragrafoPreco.className = 'preco';
  const preco = document.createElement('strong');
  preco.textContent = `${produto.price.toFixed(2)} €`;
  paragrafoPreco.append(preco);

  // Footer com botão para remover
  const footer = document.createElement('footer');
  const botaoRemover = document.createElement('button');
  botaoRemover.type = 'button';
  botaoRemover.textContent = 'Remover do Cesto';
  botaoRemover.addEventListener('click', () => removerDoCesto(produto.id));
  footer.append(botaoRemover);

  // Montagem final do <article> no cesto
  artigo.append(header, paragrafoPreco, footer);

  return artigo;
}

atualizarCesto();
