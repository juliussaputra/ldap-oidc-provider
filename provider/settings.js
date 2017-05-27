/* eslint-disable max-len */

"use strict";

const pkg = require("../package.json");

module.exports.config = {
  // session management
    acrValues: ["session", "urn:mace:switch.ch:SWITCHaai:eduid.ch"],
    cookies: {
        long: { signed: true },
        short: { signed: true },
    },
  // additional elements to discover
    discovery: {
        service_documentation: pkg.homepage,
        version: pkg.version,
    },
  // define what claims are provided for which scopes,
  // this example uses the standard claims
    claims: {
        amr: null,
        address: ["address"],
        email: ["email", "email_verified"],
        phone: ["phone_number", "phone_number_verified"],
        profile: ["birthdate", "family_name", "gender", "given_name", "locale", "middle_name", "name",
            "nickname", "picture", "preferred_username", "profile", "updated_at", "website", "zoneinfo"],
    },
  // oidc-provider features
    features: {
        devInteractions: false,
        claimsParameter: true,
        clientCredentials: true,
        encryption: true,
        introspection: true,
        registration: true,
        registrationManagement: false,
        request: true,
        requestUri: true,
        revocation: true,
        sessionManagement: true,
        backchannelLogout: true,
    },
  // ???
    subjectTypes: ["public", "pairwise"],
    pairwiseSalt: "da1c442b365b563dfc121f285a11eedee5bbff7110d55c88"
};
