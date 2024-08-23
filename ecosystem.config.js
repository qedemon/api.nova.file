module.exports = {
  apps : [{
    name   : "nova_api_file",
    cwd: __dirname,
    script : "server.js",
    instances: 0,
    exec_mode: "cluster",
    max_memory_restart : "1G",
    watch: true,
    env: {
      "NODE_PATH": `${__dirname}`
    }
  }]
}
