const svgLogo = d3.select("#logos");
const svgInfo = d3.select("#info");
const svgTreemap = d3.select("#piechart");
const svgMap = d3.select("#us-map");
console.log(svgMap); // Verifica si el SVG se seleccionó correctamente

// Diccionario para convertir abreviaturas de estados a nombres completos
const stateAbbreviations = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire",
    "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina",
    "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania",
    "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee",
    "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
};

let radio = 75;
let distancia = 150;
let posiciones_circle = [];

// Variable para almacenar el logo actualmente seleccionado
let selectedLogo = null;


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
            .attr("fill", "white") // Fondo inicial
            .attr("class", "logo-circle"); // Clase para estilos futuros

      group.append("image")
    .attr("xlink:href", function (d, i) {
        return logosAMostrar[i]; // Asignar un logo distinto a cada círculo
    })
    .attr("width", radio * 2)
    .attr("height", radio * 2)
    .attr("x", -radio)
    .attr("y", -radio)
    .on("mouseover", function (event, d) {
        // Expandir el logo al pasar el mouse
        d3.select(this)
            .transition()
            .duration(200)
            .attr("width", radio * 2.3)
            .attr("height", radio * 2.3)
            .attr("x", -radio * 1.15)
            .attr("y", -radio * 1.15);
    })
    .on("mouseout", function (event, d) {
        // Restaurar el tamaño original al quitar el mouse
        d3.select(this)
            .transition()
            .duration(200)
            .attr("width", radio * 2)
            .attr("height", radio * 2)
            .attr("x", -radio)
            .attr("y", -radio);
    })
    .on("click", function (event, d) {
        // Seleccionar el grupo actual y sus elementos
        let currentGroup = d3.select(this.parentNode);

        // Si ya hay un logo seleccionado, restaurarlo
        if (selectedLogo) {
            d3.select(selectedLogo).select("image")
                .transition()
                .duration(200)
                .attr("width", radio * 2)
                .attr("height", radio * 2)
                .attr("x", -radio)
                .attr("y", -radio);

            d3.select(selectedLogo).select("circle")
                .transition()
                .duration(200)
                .attr("fill", "white");
        }

        // Marcar el logo actual como seleccionado
        selectedLogo = currentGroup.node();

        // Destacar el logo seleccionado
        d3.select(this)
            .transition()
            .duration(200)
            .attr("width", radio * 2.5)
            .attr("height", radio * 2.5)
            .attr("x", -radio * 1.25)
            .attr("y", -radio * 1.25);

        // Cambiar el fondo del círculo
        currentGroup.select("circle")
            .transition()
            .duration(200)
            .attr("fill", "#ffcccb"); // Cambiar a color destacado

        // Mostrar la información y generar el gráfico de pie
        let logoUrl = d3.select(this).attr("xlink:href");
        MouseOverLogo(logoUrl, incommingData); // Mostrar info
        generateTreemap(logoUrl, incommingData);
        highlightStatesInMap(["NY"]); // Resalta solo el estado de Nueva York
        highlightTopStates(logoUrl, incommingData);
    });


        // Diccionario con enlaces para cada cadena
const linksCadenas = {
    "McDonald’s": "https://www.mcdonalds.com",
    "Wendy’s": "https://www.wendys.com",
    "Burger King": "https://www.burgerking.com",
    "Dunkin’": "https://www.dunkindonuts.com",
    "Chipotle Mexican Grill": "https://www.chipotle.com",
    "Taco Bell": "https://www.tacobell.com",
    "Starbucks": "https://www.starbucks.com",
    "Tropical Smoothie Cafe": "https://www.tropicalsmoothie.com",
    "Panera Bread": "https://www.panerabread.com",
    "Subway": "https://www.subway.com",
    "KFC": "https://www.kfc.com",
    "Chick-fil-A": "https://www.chick-fil-a.com",
    "Popeyes": "https://www.popeyes.com",
    "Pizza Hut": "https://www.pizzahut.com",
    "Panda Express": "https://www.pandaexpress.com"
};

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

        // Verificar si el nombre de la cadena tiene un enlace asociado
        if (linksCadenas[nombreCadena]) {
            // Agregar un botón que redirija al enlace
            const foreignObject = svgInfo.append("foreignObject")
                .attr("x", 10)
                .attr("y", 280)
                .attr("width", 680)
                .attr("height", 50);

            const buttonDiv = foreignObject.append("xhtml:div")
                .style("display", "flex")
                .style("justify-content", "center")
                .style("align-items", "center");

            buttonDiv.append("button")
                .text("Ver menú")
                .style("padding", "10px 20px")
                .style("font-size", "16px")
                .style("background-color", "#007BFF")
                .style("color", "white")
                .style("border", "none")
                .style("border-radius", "5px")
                .style("cursor", "pointer")
                .on("click", () => {
                    window.open(linksCadenas[nombreCadena], "_blank"); // Abre el enlace en una nueva pestaña
                });
        }
    }
}
              
        function generateTreemap(logoUrl, data) {
            // Filtrar los datos asociados al logo
            let datosLogo = data.filter(d => d.url_logo === logoUrl);

            if (datosLogo.length > 0) {
                // Agrupar y contar las instancias por estado
                let instanciasPorEstado = d3.rollup(datosLogo, v => v.length, d => d.estado);
                let estadoDatos = Array.from(instanciasPorEstado, ([estado, valor]) => ({ estado, valor }));

                // Ordenar por valor descendente y tomar solo los top 5
                let topEstados = estadoDatos.sort((a, b) => b.valor - a.valor).slice(0, 5);

                // Crear una estructura jerárquica requerida por el treemap
                let root = d3.hierarchy({ children: topEstados })
                    .sum(d => d.valor)
                    .sort((a, b) => b.value - a.value); // Ordenar los rectángulos por valor

                // Crear layout de treemap
                d3.treemap()
                    .size([700, 400]) // Tamaño del SVG
                    .padding(2)
                    .paddingTop(40) // Espaciado entre rectángulos
                    (root);

                // Limpiar el SVG del treemap antes de dibujar
                svgTreemap.selectAll("*").remove();

                // Título del gráfico
                svgTreemap.append("text")
                    .attr("x", 350) // Centrar horizontalmente (700 / 2)
                    .attr("y", 30)  // Posición vertical del título
                    .style("font-size", "20px") // Tamaño del texto
                    .style("font-family", "'Open Sans', sans-serif")  // Usar Open Sans
                    .style("fill", "black") // Color del texto
                    .style("font-weight", "bold") // Hacer el texto en negrita
                    .attr("text-anchor", "middle") // Centrar el texto
                    .text("Top 5 estados con mayor n° de locales:"); // Texto del título

                // Seleccionar nodos hoja y dibujar rectángulos
                let nodes = svgTreemap.selectAll("g")
                    .data(root.leaves())
                    .enter()
                    .append("g")
                    .attr("transform", d => `translate(${d.x0},${d.y0})`);

                // Dibujar los rectángulos
                nodes.append("rect")
                    .attr("width", d => d.x1 - d.x0)
                    .attr("height", d => d.y1 - d.y0)
                    .attr("fill", (d, i) => d3.schemeCategory10[i % 10]) // Colores categóricos
                    .attr("stroke", "black");

                // Calcular el total de locales de los top 5
                const totalLocales = d3.sum(root.leaves(), d => d.data.valor);

                // Agregar etiquetas
                nodes.append("text")
                    .attr("x", 5) // Margen dentro del rectángulo
                    .attr("y", 20)
                    .style("font-family", "'Open Sans', sans-serif")
                    .style("font-size", "18px")
                    .style("fill", "white")
                    .selectAll("tspan")
                    .data(d => [
                        `${d.data.estado}: ${d.data.valor}`, // Número de locales
                        `(${((d.data.valor / totalLocales) * 100).toFixed(1)}%)` // Porcentaje del total
                    ])
                    .enter()
                    .append("tspan")
                    .attr("x", 5) // Alineación inicial de cada línea
                    .attr("dy", (d, i) => i * 15) // Desplazar la segunda línea hacia abajo
                    .text(d => d);
            }
        }

        d3.json("gz_2010_us_040_00_20m.json").then(function (usMapData) {
            console.log("Archivo JSON cargado exitosamente.", usMapData);

            // Crear un generador de proyección para el mapa de EE.UU
            const projection = d3.geoAlbersUsa()
                .scale(1000)  // Escala de la proyección
                .translate([400, 300]); // Desplazar al centro del SVG

            const path = d3.geoPath().projection(projection);

            // 2. Dibujar el mapa base de EE.UU
            console.log("Dibujando mapa base...");
            svgMap.append("g")
                .selectAll("path")
                .data(usMapData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#ccc")  // Color base de los estados
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);

            console.log("Mapa base dibujado.");
        })

        // Función para filtrar los datos y obtener los 5 estados con mayor presencia
        function highlightTopStates(logoUrl, data) {
            // Filtrar los datos para obtener aquellos que coinciden con el logoUrl
            let datosLogo = data.filter(d => d.url_logo === logoUrl);

            // Agrupar los datos por estado y contar la cantidad de veces que cada estado aparece
            let stateCounts = d3.rollup(
                datosLogo,
                v => v.length, // Contar las ocurrencias de cada estado
                d => d.estado // Agrupar por el estado
            );

            // Convertir el Map a un array de objetos y ordenarlos por cantidad de presencia
            let topStates = Array.from(stateCounts.entries()) // Convertir el Map en un array
                .sort((a, b) => b[1] - a[1]) // Ordenar por la cantidad descendente
                .slice(0, 5) // Tomar los 5 primeros
                .map(d => d[0]); // Extraer solo los nombres de los estados

            console.log("Top 5 estados con mayor presencia:", topStates);

            // Llamar a la función que resalta los estados en el mapa
            highlightStatesInMap(topStates);
        }

// Función para resaltar los estados en el mapa
        function highlightStatesInMap(topStates) {
            // Convertir las abreviaciones de los estados en topStates a nombres completos
            const topStatesFullNames = topStates.map(abbreviation => stateAbbreviations[abbreviation]);

            // Selecciona todos los elementos del mapa (asumiendo que los estados son <path>)
            svgMap.selectAll("path")
                .attr("fill", function (d) {
                    // Si el nombre completo del estado está en topStatesFullNames, resaltar
                    if (topStatesFullNames.includes(d.properties.NAME)) {
                        return "#ffcc00";  // Color para los estados más destacados
                    } else {
                        return "#ccc";  // Color por defecto para el resto de los estados
                    }
                });
        }
        // Diccionario de GIFs por cadena
const gifDict = {
    // Hamburguesas
    "McDonald’s": "hamburguesa.gif",
    "Wendy’s": "hamburguesa.gif",
    "Burger King": "hamburguesa.gif",

    // Donas
    "Dunkin’": "donas.gif",

    // Comida Mexicana
    "Chipotle Mexican Grill": "mexico.gif",
    "Taco Bell": "mexico.gif",

    // Batidos y bebidas
    "Starbucks": "batido.gif",
    "Tropical Smoothie Cafe": "batido.gif",
    "Panera Bread": "batido.gif",

    // Sandwiches
    "Subway": "sandwich.gif",

    // Pollo
    "KFC": "pollo.gif",
    "Chick-fil-A": "pollo.gif",
    "Popeyes": "pollo.gif",

    // Pizza
    "Pizza Hut": "pizza.gif",

    // Comida China
    "Panda Express": "chino.gif"
};




// Función que muestra la información asociada al logo en el SVG #info
function MouseOverLogo(logoUrl, data) {
    let datosLogo = data.filter(d => d.url_logo === logoUrl);

    if (datosLogo.length > 0) {
        let recuentoID = datosLogo.length;
        let nombreCadena = datosLogo[0].nombre_cadena;
        let promedioScore = d3.mean(datosLogo, d => +d.score).toFixed(2);
        let sumaRatings = d3.sum(datosLogo, d => +d.ratings);
        let categoria = datosLogo[0].category;
        let listaEstados = Array.from(new Set(datosLogo.map(d => d.estado))).join(", ");

        svgInfo.selectAll("*").remove();

        function agregarTexto(contenido, yPos, fontSize) {
            svgInfo.append("text")
                .text(contenido)
                .attr("x", 10)
                .attr("y", yPos)
                .style("font-family", "'Open Sans', sans-serif")
                .style("font-size", fontSize)
                .style("fill", "black")
                .attr("text-anchor", "start");
        }

        agregarTexto(`Nombre de la Cadena: ${nombreCadena}`, 60, "20px");
        agregarTexto(`Cantidad de locales: ${recuentoID}`, 100, "20px");
        agregarTexto(`Puntuación promedio: ${promedioScore}`, 140, "20px");
        agregarTexto(`Cantidad de reviews: ${sumaRatings}`, 180, "20px");
        agregarTexto(`Categorías: ${categoria}`, 220, "15px");
        agregarTexto(`Estados en los que está: ${listaEstados}`, 260, "14px");

        // Actualizar GIF
        let gifUrl = gifDict[nombreCadena] || "https://example.com/default.gif"; // GIF por defecto si no hay coincidencia
        d3.select("#gif-image")
            .attr("src", gifUrl)
            .attr("alt", `GIF de ${nombreCadena}`);
    }
}

    })
    .catch(function (error) {
        console.error('Error al cargar el archivo CSV:', error);
    });

