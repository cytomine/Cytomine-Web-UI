<!-- Copyright (c) 2009-2021. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->


<script>
/**
 * @module zoomify-source/source
 */
import ZoomifySource from 'ol/source/Zoomify';
import {createFromTileUrlFunctions} from 'ol/tileurlfunction';
import tileSource from 'vuelayers/lib/mixin/tile-source';
import TileGrid from 'ol/tilegrid/TileGrid';
import {DEFAULT_TILE_SIZE} from 'ol/tilegrid/common';

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
  url: {
    type: [String, Function],
    required: false // override property since it is not required if urls is set
  },
  urls: {
    type: Array
  },
  tileSize: {
    type: Number,
    default: DEFAULT_TILE_SIZE
  },
};

const data = () => {
  return {
    tierSizeInTiles: null,
    tileCountUpToTier: null,
    resolutions: null
  };
};

function created() { // source: https://github.com/openlayers/openlayers/blob/v5.3.0/src/ol/source/Zoomify.js#L137
  const size = this.size;
  const imageWidth = size[0];
  const imageHeight = size[1];
  const tierSizeInTiles = [];
  let tileSizeForTierSizeCalculation = this.tileSize;
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

  this.tierSizeInTiles = tierSizeInTiles;
  this.tileCountUpToTier = tileCountUpToTier;
  this.resolutions = resolutions;
}

const methods = {
  createSource() {
    if(!this.url && !this.urls) {
      throw new Error('Either url or urls properties must be set for ZoomifySource');
    }

    let source = new ZoomifySource({
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
      tileSize: this.tileSize
    });

    if(this.urls) {
      const tileUrlFunction = createFromTileUrlFunctions(this.urls.map(this.createFromTemplate(source)));
      source.setTileUrlFunction(tileUrlFunction);
    }

    return source;
  },
  createTileGrid() {
    const extent = this.extent || [0, -this.size[1], this.size[0], 0];
    return new TileGrid({
      tileSize: this.tileSize,
      extent: extent,
      origin: [extent[0], extent[3]],
      resolutions: this.resolutions,
    });
  },
  // source: https://github.com/openlayers/openlayers/blob/v5.3.0/src/ol/source/Zoomify.js#L202
  // temporary hack since Zoomify does not support multiple URLs (https://github.com/openlayers/openlayers/issues/9352)
  createFromTemplate(source) {
    return template => {
      return (
        (tileCoord) => {
          if (!tileCoord) {
            return undefined;
          }
          else {
            const tileCoordZ = tileCoord[0];
            const tileCoordX = tileCoord[1];
            const tileCoordY = -tileCoord[2] - 1;
            const tileIndex = tileCoordX + tileCoordY * this.tierSizeInTiles[tileCoordZ][0];
            const tileSize = source.tileGrid.getTileSize(tileCoordZ);
            const tileWidth = Array.isArray(tileSize) ? tileSize[0] : tileSize;
            const tileGroup = ((tileIndex + this.tileCountUpToTier[tileCoordZ]) / tileWidth) | 0;
            const localContext = {
              'z': tileCoordZ,
              'x': tileCoordX,
              'y': tileCoordY,
              'tileIndex': tileIndex,
              'TileGroup': 'TileGroup' + tileGroup
            };
            return template.replace(/\{(\w+?)\}/g, function(m, p) {
              return localContext[p];
            });
          }
        }
      );
    };
  }
};

const watch = {
  urls() {
    const tileUrlFunction = createFromTileUrlFunctions(this.urls.map(this.createFromTemplate(this.$source)));
    this.$source.setTileUrlFunction(tileUrlFunction);
    this.$source.refresh();
  },
};

export default {
  name: 'vl-source-zoomify',
  mixins: [tileSource],
  props,
  data,
  methods,
  watch,
  created
};
</script>
