const svgLogo = d3.select("#logos");
const svgInfo = d3.select("#info");
const svgPieChart = d3.select("#piechart");

let radio = 75;
let distancia = 150;
let posiciones_circle = [];

// Generar posiciones espaciadas uniformemente en una cuadrícula para los logos
for (let x = distancia; x <= 800 - distancia; x += distancia) {
    for (let y = distancia; y <= 800 - distancia; y += distancia) {
        posiciones_circle.push({x: x, y: y});
    }
}

// Cargar los datos desde el CSV
d3.csv("CadenasCleanConLogos.csv")
    .then(function (incommingData) {
        // Obtener las URLs de los logos únicos
        let logosUnicos = Array.from(new Set(incommingData.map(d => d.url_logo)));

        // Limitar la cantidad de logos a la cantidad de círculos disponibles
        let logosAMostrar = logosUnicos.slice(0, posiciones_circle.length);

        // Dibujar los círculos y las imágenes en el SVG de logos
        let group = svgLogo.append("g")
            .selectAll("g")
            .data(posiciones_circle)
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        group.append("circle")
            .attr("r", radio)
            .attr("fill", "none");

        group.append("image")
            .attr("xlink:href", function (d, i) {
                return logosAMostrar[i]; // Asignar un logo distinto a cada círculo
            })
            .attr("width", radio * 2)
            .attr("height", radio * 2)
            .attr("x", -radio)
            .attr("y", -radio)
            .on("mouseover", function (event, d) {
                let logoUrl = d3.select(this).attr("xlink:href");
                MouseOverLogo(logoUrl, incommingData);  // Llamar a la función con el URL del logo
                generatePieChart(logoUrl, incommingData);  // Generar el pie chart al pasar el mouse sobre el logo
            });

        // Función que muestra la información asociada al logo en el SVG #info
        function MouseOverLogo(logoUrl, data) {
            let datosLogo = data.filter(d => d.url_logo === logoUrl);

            if (datosLogo.length > 0) {
                // Obtener la información solicitada
                let recuentoID = datosLogo.length;
                let nombreCadena = datosLogo[0].nombre_cadena;
                let promedioScore = d3.mean(datosLogo, d => +d.score).toFixed(2);  // Promedio de score
                let sumaRatings = d3.sum(datosLogo, d => +d.ratings);  // Suma de ratings
                let categoria = datosLogo[0].category;
                let listaEstados = Array.from(new Set(datosLogo.map(d => d.estado))).join(", ");  // Lista de estados únicos

                // Mostrar la información en el SVG de info
                svgInfo.selectAll("*").remove();  // Limpiar antes de actualizar

                // Título de la información
                svgInfo.append("text")
                    .text("Información de la cadena seleccionada")
                    .attr("x", 350)  // Centrar el título en el SVG
                    .attr("y", 20)   // Posición vertical del título
                    .style("font-family", "'Open Sans', sans-serif")  // Usar Open Sans
                    .style("font-size", "24px")  // Tamaño del texto del título
                    .style("font-weight", "bold") // Negrita
                    .style("fill", "black")       // Color del texto
                    .attr("text-anchor", "middle"); // Centrar el texto horizontalmente

                // Función para centrar el texto hacia la izquierda con margen
                function agregarTexto(contenido, yPos, fontSize) {
                    svgInfo.append("text")
                        .text(contenido)
                        .attr("x", 10)  // Margen izquierdo de 10px
                        .attr("y", yPos)
                        .style("font-family", "'Open Sans', sans-serif")  // Usar Open Sans
                        .style("font-size", fontSize)
                        .style("fill", "black")
                        .attr("text-anchor", "start"); // Alinear el texto a la izquierda
                }

                // Agregar los textos con el nuevo orden
                agregarTexto(`Nombre de la Cadena: ${nombreCadena}`, 60, "20px");
                agregarTexto(`Cantidad de locales: ${recuentoID}`, 100, "20px");
                agregarTexto(`Puntuación promedio: ${promedioScore}`, 140, "20px");
                agregarTexto(`Cantidad de reviews: ${sumaRatings}`, 180, "20px");
                agregarTexto(`Categorías: ${categoria}`, 220, "15px");
                agregarTexto(`Estados en los que está: ${listaEstados}`, 260, "14px");
            }
        }

// Función para generar el gráfico de pie con la cantidad de instancias por estado
        function generatePieChart(logoUrl, data) {
            // Filtrar los datos asociados a ese logo
            let datosLogo = data.filter(d => d.url_logo === logoUrl);

            if (datosLogo.length > 0) {
                // Agrupar y contar las instancias por estado
                let instanciasPorEstado = d3.rollup(datosLogo, v => v.length, d => d.estado);
                let estados = Array.from(instanciasPorEstado.keys());
                let valores = Array.from(instanciasPorEstado.values());

                // Crear un array de objetos para facilitar la ordenación
                let estadoDatos = estados.map((estado, i) => ({ estado, valor: valores[i] }));

                // Ordenar los estados por valor (instancias) en orden descendente
                estadoDatos.sort((a, b) => b.valor - a.valor);

                // Quedarse solo con los 5 estados con más instancias
                let topEstados = estadoDatos.slice(0, 5);

                // Extraer los estados y valores de los 5 principales
                let estadosTop = topEstados.map(d => d.estado);
                let valoresTop = topEstados.map(d => d.valor);

                // Limpiar el SVG del pie chart antes de dibujar
                svgPieChart.selectAll("*").remove();

                // Título del gráfico
                svgPieChart.append("text")
                    .attr("x", 350) // Centrar horizontalmente (700 / 2)
                    .attr("y", 30)  // Posición vertical del título
                    .style("font-size", "20px") // Tamaño del texto
                    .style("font-family", "'Open Sans', sans-serif")  // Usar Open Sans
                    .style("fill", "black") // Color del texto
                    .style("font-weight", "bold") // Hacer el texto en negrita
                    .attr("text-anchor", "middle") // Centrar el texto
                    .text("Distribución de los 5 estados con más locales de la cadena seleccionada"); // Texto del título

                // Configurar el gráfico de pie
                let radius = Math.min(430, 430) / 2 - 10;  // Calcular el radio del gráfico de pie

                let pie = d3.pie().value(d => d)(valoresTop);  // Crear los segmentos del gráfico de pie

                let arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius);

                // Definir colores personalizados
                const coloresPersonalizados = [
                    "#1f77b4", "#ff7f0e", "#2ca02c", "#ffff",
                    "#9467bd"
                ];

                // Crear el color ordinal utilizando el array de colores personalizados
                let color = d3.scaleOrdinal()
                    .domain(estadosTop) // Define el dominio según los estados
                    .range(coloresPersonalizados);  // Usar colores personalizados

                // Crear el grupo que contendrá el pie chart, centrado en el SVG
                let g = svgPieChart.append("g")
                    .attr("transform", "translate(" + (700 / 2) + "," + (500 / 2) + ")");  // Centrar el pie chart

                // Dibujar los segmentos del pie chart con contorno negro y más marcado
                g.selectAll("path")
                    .data(pie)
                    .enter()
                    .append("path")
                    .attr("d", arc)
                    .attr("fill", (d, i) => color(estadosTop[i])) // Asignar el color según el estado
                    .attr("stroke", "black") // Contorno negro marcado
                    .style("stroke-width", "3px");  // Grosor del contorno

                // Añadir etiquetas de los estados en el gráfico
                g.selectAll("text")
                    .data(pie)
                    .enter()
                    .append("text")
                    .attr("transform", function (d) {
                        return "translate(" + arc.centroid(d) + ")"; // Posición centrada
                    })
                    .attr("dy", "0.35em")
                    .style("text-anchor", "middle")
                    .style("font-family", "'Open Sans', sans-serif")  // Usar Open Sans
                    .style("font-size", "18px")
                    .style("fill", "white") // Color del texto en las etiquetas
                    .text((d, i) => `${estadosTop[i]}: ${((valoresTop[i] / d3.sum(valoresTop)) * 100).toFixed(1)}%`); // Texto con porcentaje

                // Crear leyenda al lado del pie chart
                let legendGroup = svgPieChart.append("g")
                    .attr("transform", "translate(600, 100)"); // Ajustar la posición de la leyenda

                // Añadir leyenda
                estadosTop.forEach((estado, i) => {
                    let legendItem = legendGroup.append("g")
                        .attr("transform", "translate(0," + (i * 20) + ")"); // Espaciado vertical entre elementos de la leyenda

                    legendItem.append("rect")
                        .attr("width", 18)
                        .attr("height", 18)
                        .attr("fill", color(estado)); // Color del rectángulo según el estado

                    legendItem.append("text")
                        .text(estado)
                        .attr("x", 25) // Desplazado a la derecha del rectángulo
                        .attr("y", 15)
                        .style("font-family", "'Open Sans', sans-serif")  // Usar Open Sans
                        .style("fill", "black"); // Color del texto en la leyenda
                });
            }
        }


    })
    .catch(function (error) {
        console.error('Error al cargar el archivo CSV:', error);
    });

