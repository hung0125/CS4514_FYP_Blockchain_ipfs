class HTTPRequest {

    constructor(url, requestType, requestBody) {
        //requestType: 'GET', 'POST'
        this.url = url;
        this.requestType = requestType;
        this.requestBody = requestBody;
    }

    getURL() {
        return this.url;
    }

    async sendAwait() {
        var response;
        if (this.requestBody) {
            await fetch(this.url, {method: this.requestType, body: this.requestBody}).then(
                async (resp) => {
                    await resp.text().then((webCont)=> {
                        response = webCont;
                    });
                }
            );
        }else {
            await fetch(this.url, {method: this.requestType}).then(
                async (resp) => {
                    await resp.text().then((webCont)=> {
                        response = webCont;
                    });
                }
            );
        }
        return response;
    }

    async getStatusCode() {
        const response = await fetch(this.url);
        return response.status;
    }
}

export default HTTPRequest;