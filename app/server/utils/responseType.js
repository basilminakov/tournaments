var types = {
  OK: { status: 200 },
  ERROR: { status: 400 },
  NOTFOUND: {status: 404},
  EXCEPTION: { status: 500 }
};

class ResponseType {

  constructor() {
    this.types = types;
  }

  Ok() { 
    return this.types.OK.status;
  }

  Error() {
    return this.types.ERROR.status;
  }

  Exception() {
    return this.types.EXCEPTION.status;
  }

  NotFound() {
    return this.types.NOTFOUND.status;
  }

}

module.exports = ResponseType;