<script>
/**
 * @module zoomify-source/source
 */
import ZoomifySource from "ol/source/Zoomify";
import tileSource from "vuelayers/lib/mixin/tile-source";
import TileGrid from "ol/tilegrid/TileGrid";

const props = {
    tierSizeCalculation: {
        type: String,
    },
    extent: {
        type: Array,
    },
    size: {
        type: Array,
    },
};

const methods = {
    createSource() {
        return new ZoomifySource({
            attributions: this.attributions,
            cacheSize: this.cacheSize,
            crossOrigin: this.crossOrigin,
            projection: this.projection,
            reprojectionErrorThreshold: this.reprojectionErrorThreshold,
            url: this.urlTmpl,
            tierSizeCalculation: this.tierSizeCalculation,
            size: this.size,
            extent: this.extent,
            transition: this.transition,
            tileSize: this.tileSize[0],
        });
    },
    createTileGrid() {
        const imageWidth = this.size[0];
        const imageHeight = this.size[1];
        const tierSizeInTiles = [];
        const tileSize = this.tileSize || 256;
        let tileSizeForTierSizeCalculation = tileSize;
        while (imageWidth > tileSizeForTierSizeCalculation || imageHeight > tileSizeForTierSizeCalculation) {
            tierSizeInTiles.push([
                Math.ceil(imageWidth / tileSizeForTierSizeCalculation),
                Math.ceil(imageHeight / tileSizeForTierSizeCalculation),
            ]);
            tileSizeForTierSizeCalculation += tileSizeForTierSizeCalculation;
        }
        tierSizeInTiles.push([1, 1]);
        tierSizeInTiles.reverse();

        const resolutions = [1];
        const tileCountUpToTier = [0];
        for (let i = 1, ii = tierSizeInTiles.length; i < ii; i++) {
            resolutions.push(1 << i);
            tileCountUpToTier.push(
                tierSizeInTiles[i - 1][0] * tierSizeInTiles[i - 1][1] +
                tileCountUpToTier[i - 1]
            );
        }
        resolutions.reverse();

        const extent = this.extent || [0, -this.size[1], this.size[0], 0];
        return new TileGrid({
            tileSize: tileSize,
            extent: extent,
            origin: [extent[0], extent[3]],
            resolutions: resolutions,
        });
    },
};

export default {
    name: "vl-source-zoomify",
    mixins: [tileSource],
    props,
    methods,
};
</script>
