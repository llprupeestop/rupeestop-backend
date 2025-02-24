class ApiResponse {
  constructor(status, message = "Success", data = null) {
    this.success = status < 400;
    this.status = status;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
export { ApiResponse };
