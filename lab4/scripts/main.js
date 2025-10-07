let contador = 0;

// Pintar o texto
function pintar(cor) {
    const area2 = document.querySelector("#area2 span");
    area2.style.color = cor;
}

// Texto digitado
function mostrarTexto() {
            const campoTexto = document.getElementById('campoTexto');

            campoTexto.style.backgroundColor = getRandomColor();
        }

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }



// Contador
function contar() {
    contador++;
    document.getElementById("contador").textContent = contador;
}

// 1-> mouseover
document.getElementById("area1").addEventListener("mouseover", function() {
    this.textContent = "1. Impressionate!";
});

// 2-> mouseout
document.getElementById("area1").addEventListener("mouseout", function() {
    this.textContent = "1. Passa por aqui!";
});

// 3->mousemove 
function mudarCor(event) {
    event.preventDefault();
    const cor = document.getElementById("corEscolhida").value;
    document.body.style.backgroundColor = cor;
}
        const area = document.getElementById('area');

        area.addEventListener('mousemove', function() {
            area.style.backgroundColor = getRandomColor();
        });

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

