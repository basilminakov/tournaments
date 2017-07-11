
class ResponseProducer {

  static buildResponse(response, status, message) {
    message = message || '';
    if (response) {
      response.status(status).send(message).end();
    } else {
      console.log(new Date(), 'status code:', status, message);
    }
  }
}

module.exports = ResponseProducer;