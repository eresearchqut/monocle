# SVG Maps

## Rules


## Optimising your svg

1. Open the [SVGO](https://github.com/svg/svgo) [GUI](https://jakearchibald.github.io/svgomg/)
2. Open the SVG file
3. Select the following settings as enabled
   1. Merge paths
   2. Collapse useless groups
   3. Remove <title>
   4. Remove <desc>
   5. Prefer viewBox to width/height
   6. Remove script elements
   7. Remove unused namespaces
   8. Minify colours
4. Copy the output into src/component/SvgMap/svg/<file_name>.svg

