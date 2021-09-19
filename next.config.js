
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/export/:type',
        destination: `https://g3b83bgsl8.execute-api.ap-southeast-1.amazonaws.com/default/my_lambda_function_2/:type`,
      }
    ]
  }
}