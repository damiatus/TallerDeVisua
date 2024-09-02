// Datos de ejemplo
const datos = [
    { id: 1, nombreAlbum: 'Álbum 1', valor: 150, inicio: 0, fin: 1 },
    { id: 2, nombreAlbum: 'Álbum 2', valor: 200, inicio: 0, fin: 2 },
    { id: 3, nombreAlbum: 'Álbum 3', valor: 120, inicio: 0, fin: 3 },
    { id: 4, nombreAlbum: 'Álbum 4', valor: 180, inicio: 0, fin: 4 }
];

// Escalas
const escalaAltura = d3.scaleLinear()
    .domain([0, d3.max(datos, d => d.valor)])
    .range([0, 300]);

// SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", 800)
    .attr("height", 400);

function inicializar() {
    // Creación de grupos
    const grupos = svg.selectAll("g")
        .data(datos)
        .enter()
        .append("g")
        .attr("class", "grupo")
        .attr("transform", (d, i) => `translate(${i * 100}, 0)`);

    // Rectángulos
    grupos.append("rect")
        .attr("width", 50) // ancho fijo inicial
        .attr("height", d => escalaAltura(d.valor))
        .attr("fill", "blue");

    // Nombre del álbum
    grupos.append("text")
        .attr("y", d => escalaAltura(d.valor) + 15)
        .attr("x", 25)
        .attr("text-anchor", "middle")
        .text(d => d.nombreAlbum);

    // Cantidad
    grupos.append("text")
        .attr("y", d => escalaAltura(d.valor) - 5)
        .attr("x", 25)
        .attr("text-anchor", "middle")
        .text(d => d.valor);
}

function aplicarTransiciones() {
    const grupos = svg.selectAll(".grupo");

    // Transición para los grupos
    grupos.transition()
        .duration(1000)
        .attr("transform", d => `translate(${encontrarPosicionPorId(d.id)}, 0)`);

    // Transición en los rectángulos para que su ancho cambie con la función ratio
    grupos.select("rect").transition()
        .duration(1000)
        .attr("width", d => ratio(d.inicio, d.fin) * 100);

    // Transición en los rectángulos para que el color cambie
    const color = d3.scaleSequential(d3.interpolateCool)
        .domain([0, d3.max(datos, d => d.valor)]);

    grupos.select("rect").transition()
        .duration(1000)
        .attr("fill", d => color(ratio(d.inicio, d.fin)));

    // Transición en los números para que se muevan
    grupos.selectAll("text").transition()
        .duration(1000)
        .attr("x", d => ratio(d.inicio, d.fin) * 50 / 2);

    // Transición en los números para que parezca que están cambiando
    grupos.selectAll("text")
        .tween("text", function(d) {
            const that = d3.select(this),
                interpolateNumber = d3.interpolateNumber(that.text().replace(/,/g, ""), ratio(d.inicio, d.fin) * d.valor);
            return function(t) {
                that.text(d3.format(",d")(interpolateNumber(t)));
            };
        });
}

// Funciones de ejemplo (debes definir las tuyas)
function encontrarPosicionPorId(id) {
    return id * 100; // lógica simple de ejemplo
}

function ratio(inicio, fin) {
    return fin - inicio; // lógica simple de ejemplo
}

// Inicializar visualización y aplicar transiciones
inicializar();
aplicarTransiciones();
