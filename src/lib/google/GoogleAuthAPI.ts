

export class GoogleAuthAPI {
    apiKey: string;
    clientId: string;
    scope: string;
    discoverDocs: Array<string>;
    authInstance: any;

    constructor(apiKey, clientId, scope, discoverDocs, onLoaded, onSignInStatusChanged) {
        this.apiKey = apiKey;
        this.clientId = clientId;
        this.scope = scope;
        this.discoverDocs = discoverDocs;

        gapi.load('client:auth2', () => {
            gapi.client.init({
                'apiKey': this.apiKey,
                'clientId': this.clientId,
                'scope': this.scope,
                'discoveryDocs': this.discoverDocs
            }).then( () => {
                this.authInstance = gapi.auth2.getAuthInstance();

                // Listen for sign-in state changes.
                this.authInstance.isSignedIn.listen(onSignInStatusChanged);

                onLoaded(this.isSignedIn());
            });
        });
    }

    getCurrentUser() {
        return this.authInstance.currentUser.get();
    }

    isSignedIn() {
        return this.authInstance.isSignedIn.get();
    }

    signIn() {
        this.authInstance.signIn();
    }

    signOut() {
        if (! this.authInstance.isSignedIn.get()) {
            console.warn("Not signed in.");
            return;
        }
        this.authInstance.signOut();
    }

    revoke() {
        this.authInstance.disconnect();
    }

}

