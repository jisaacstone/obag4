import EsriJSON from 'ol/format/EsriJSON.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import ImageTile from 'ol/source/ImageTile.js';
import VectorSource from 'ol/source/Vector.js';
import Geometry from 'ol/geom/Geometry.js';
import WKT from 'ol/format/WKT.js';
import { Fill, Stroke, Style } from 'ol/style.js';
import { Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import { createXYZ } from 'ol/tilegrid.js';
import { tile as tileStrategy, all as allStrategy } from 'ol/loadingstrategy.js';
import { Extent } from 'ol/extent.js';
import Feature from 'ol/Feature.js';
import Projection from 'ol/proj/Projection.js';
import * as styles from 'styles';

const fillColors: {[index: string]: number[]} = {
  '1': [104, 104, 104, 1],
  '2': [0, 112, 255, 0.5],
  '3': [230, 152, 0, 1],
  '4': [0, 112, 255, 1],
};

const style = new Style({
  fill: new Fill(),
  stroke: new Stroke({
    color: [0, 0, 0, 1],
    width: 0.5,
  }),
});

const wkt = new WKT();

const parcelSourceSCC = (id: string, geom: Geometry): VectorSource => {
  let loaded = false;
  let loading = false;
  const src = new VectorSource({
    format: new GeoJSON(),
    loader: (
      extent: Extent,
      _resolution: number,
      projection: Projection,
      success,
      failure
    ) => {
      if (loading) { return; }
      if (loaded) { success && success([]) }
      loading = true;
      const proj = projection.getCode();
      const app_token = 'yqzKRsFoPdg87PUFzboWk2rSi';
      const url_base = 'https://data.sccgov.org/resource/2bmn-3ayc.geojson'
      const field = 'the_geom';
      const poly = wkt.writeGeometry(geom.clone().transform(projection, 'EPSG:4326'));
      // "%27" is a single quote - required for WKT parameters
      const url = `${url_base}?$limit=5000&$where=intersects(${field},%27${poly}%27)&$order=objectid`;
      const promise = fetch(
        url,
        { headers: {'X-App-Token': app_token} }
      ).then(
        (response) => response.json()
      ).then(
        (respObj) => {
          const format = src.getFormat();
          const fromProj = format?.readProjection(respObj);
          const features: Array<Feature> = [];
          format?.readFeatures(respObj).forEach((feature) => {
            feature.getGeometry()?.transform(fromProj, proj);
            features.push(feature);
            src.addFeature(feature);
          });
          loaded = true;
          success && success(features);
      }).catch((err) => {
        console.log('fetch error', err);
        src.removeLoadedExtent(extent);
        failure && failure();
      }).finally(() => {
        loading = false;
      });
      return promise;
    },
    strategy: allStrategy,
  });
  return src;
};

const mvZoningSource = new VectorSource({
  format: new EsriJSON(),
  url: function (_extent, _resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();
    const urlBase = 'https://maps.mountainview.gov/arcgis/rest/services/Public/ZoningDistrict/FeatureServer'
    const url = `${urlBase}/0/query?where=1%3D1&outFields=*&outSR=${srid}&f=json`;
    return url;
  },
  strategy: allStrategy,
});

const mtcSource = (serviceName: string): VectorSource => {
  return new VectorSource({
    format: new EsriJSON(),
    url: function (_extent, _resolution, projection) {
      // ArcGIS Server only wants the numeric portion of the projection ID.
      const srid = projection
        .getCode()
        .split(/:(?=\d+$)/)
        .pop();
      const url = `https://services3.arcgis.com/i2dkYWmb4wHvYPda/arcgis/rest/services/${serviceName}/FeatureServer/4/query?where=1%3D1&outFields=*&outSR=${srid}&f=json`;
      return url;
    },
    strategy: tileStrategy(
      createXYZ({
        tileSize: 512,
      }),
    ),
    attributions:
      '[DRAFT] Transit-Oriented Communities Policy Areas. MTC/ABAG'
  });
};

export const updateParcelSource = (id: string, geom: Geometry) => {
  parcelsLayer.setSource(parcelSourceSCC(id, geom));
};

export const parcelsLayer = new VectorLayer({
  opacity: 0.7,
  className: 'parcelsLayer',
  style: (feature) => {
    //console.log('style', feature.getProperties());
    return styles.zones[feature.get('zoneclass')] || styles.grey;
  }
});

export const mvZoningLayer = new VectorLayer({
  source: mvZoningSource,
  className: 'zoningLayer',
  opacity: 0.2,
  style: (feature) => {
    return styles.zones[feature.get('ZONECLASS')] || styles.grey;
  }
})

export const stationPointLayer = new VectorLayer({
  source: mtcSource('TOC_Transit_Stations_v0m'),
  opacity: 0.7,
});

export const stationAreaLayer = new VectorLayer({
  source: mtcSource('Jurisdiction_Corridor_Buffers_v3a'),
  className: 'stationAreaLayer',
  style: function (feature) {
    const classify = feature.get('service_tier');
    const color = fillColors[classify] || [0, 0, 0, 0];
    style.getFill()?.setColor(color);
    return style;
  },
  opacity: 0.7,
});

export const mapLayer = new TileLayer({
  source: new ImageTile({
    attributions:
      'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
      'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  }),
});
