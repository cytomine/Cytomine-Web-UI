module.exports = {
	devServer: {
		proxy: {
			"/api/": {
				target: 'http://localhost-core',
				changeOrigin: true,
				secure: false
			},
			"/server/": {
				target: 'http://localhost-core',
				changeOrigin: true,
				secure: false
			},
			"/j_spring": {
				target: 'http://localhost-core',
				changeOrigin: true,
				secure: false
			}
		}
	}
}
