
module.exports = {
	networks: {
		development: {
			host: "127.0.0.1",     // Localhost (default: none)
			port: 8545,            // Standard Ethereum port (default: none)
			network_id: "*",       // Any network (default: none)
		},
	},
	// plugins: ["solidity-coverage"],

	mocha: {
		reporter: 'eth-gas-reporter',
		reporterOptions: {
			gasPrice: 1,
			token: 'ETH',
		}
	},
	plugins: ["solidity-coverage"],
	// Configure your compilers
	compilers: {
		solc: {
			version: "0.8.13",    // Fetch exact version from solc-bin (default: truffle's version)
		}
	},
};
