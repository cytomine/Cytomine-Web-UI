let vendors = {
  hamamatsu: {
    imgPath: require('@/assets/brands/hamamatsu.jpg'),
    name: 'Hamamatsu Photonics'
  },
  '3dh': {
    imgPath: require('@/assets/brands/3dh.png'),
    name: '3DHISTECH Ltd.'
  },
  aperio: {
    imgPath: require('@/assets/brands/aperio.jpg'),
    name: 'Aperio'
  },
  leica: {
    imgPath: require('@/assets/brands/leica.png'),
    name: 'Leica Biosystems'
  },
  roche: {
    imgPath: require('@/assets/brands/roche.gif'),
    name: 'La Roche Ltd.'
  },
  philips: {
    imgPath: require('@/assets/brands/philips.svg'),
    name: 'Philips'
  }
};

export default function vendorFromMime(mime) {
  switch(mime) {
    case 'openslide/ndpi':
    case 'openslide/vms':
      return vendors['hamamatsu'];
    case 'openslide/mrxs':
      return vendors['3dh'];
    case 'openslide/svs':
      return vendors['aperio'];
    case 'openslide/scn':
      return vendors['leica'];
    case 'ventana/tif':
    case 'ventana/bif':
      return vendors['roche'];
    case 'philips/tif':
      return vendors['philips'];
    default:
      return null;
  }
}
