const allfiles = require.context('../src/', true, /\.jsx?$/);

allfiles.keys().forEach(allfiles);
