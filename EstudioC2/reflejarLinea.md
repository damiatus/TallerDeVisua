En el código proporcionado, la línea se refleja en torno al eje vertical cuando se manipulan los puntos para crear una línea simétrica en el eje X (el eje horizontal). Este reflejo se logra mediante la segunda parte del ciclo donde se genera la mitad derecha de la línea (que es la simétrica a la mitad izquierda).

El reflejo en torno al eje vertical ocurre en este fragmento de código:

```javascript
for (let i = frequencyData.length/2; i >= 0; i--) {
    const originalPoint = linePoints[i + 1];
    if (originalPoint) {
        const x = svgWidth
            - (
                i * (svgWidth / frequencyData.length)
                + (svgWidth / frequencyData.length) / 2
                - barPadding / 2
            );
        linePoints.push({
            x: x,
            y: originalPoint.y
        });
    }
}
```

### Explicación:
1. **Ciclo de reflejo**: Este fragmento toma la mitad de la línea generada previamente (la parte izquierda), y luego refleja estos puntos en torno al eje vertical.
2. **Cálculo del reflejo**: Para cada punto `x` de la mitad izquierda, se calcula el reflejo en el eje vertical restando `x` de `svgWidth` (el ancho del SVG).
   
   ```javascript
   const x = svgWidth - (
       i * (svgWidth / frequencyData.length)
       + (svgWidth / frequencyData.length) / 2
       - barPadding / 2
   );
   ```

   Este cálculo asegura que la coordenada `x` reflejada esté posicionada simétricamente en relación con el eje vertical, creando una imagen especular de la parte izquierda de la línea.

3. **Puntos reflejados**: Los puntos reflejados son luego añadidos a `linePoints` con la misma coordenada `y`, asegurando que la línea no se distorsione verticalmente, solo se refleje horizontalmente.

Este proceso permite que la línea, al estar reflejada en torno al eje vertical, mantenga una simetría visual de acuerdo con los valores de la frecuencia.