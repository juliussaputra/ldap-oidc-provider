## LDAP OIDC Extensions

Node OIDC Implementation for Directory Managed Users and Clients.

### Getting started

The LDAP OIDC Provider requires a recent version of [Node](http://nodejs.org).
This version has been tested on both, LTS and the Current version of Node.

### Installation

1.  Have access to an LDAP repository.
2.  Install REDIS on the local machine.
3.  Download eduid-oidc to the local machine and unpack it.
4.  Run ```cd ldap-oidc-provider; npm install```
5.  change the file ```provider_settings.js``` to match your environment
6.  Run ```node provider```
7.  Create a Web-server Proxy, so nodejs is not directly exposed.

### Advanced configuration

#### Directory organization

In order to process the directory appropriately, the organization of information
in the directory must get configured. The directory configuration has three
parts.

1.  The query parameters.
2.  The data source.
3.  The mapping from LDAP to OIDC attributes.

The query parameters and data sources are configured in the
[provider_settings.js](provider/provider_settings.js).

The query parameters allow the OIDC provider to select the correct source for
OIDC information.

All data types defined in the Object ```directoryOrganisation``` are considered
to be managed in a directory.

For each data type the following attributes can get configured:

*   class - the object class that identifies all records of that data type.
*   id - a unique identifier attribute of the LDAP record.
*   source - the data source (default ```common```).
*   bind - the identifying property that for authenticating agents. If bind is missing, then the id is used.
*   base - the bind DN for the data type. If present, this overrides the base configuration of the data source.

Example:
```javascript
module.exports.directoryOrganisation = {
    "Account": {
        class: "inetOrgPerson",
        bind: "mail",
        id: "uid",
        source: "common",
        base: "ou=users,dc=local,dc=dev"
    },
    "Client": {
        class: "organizationalRole",
        id: "cn",
        source: "common",
    },
    // client credentials SHOULD be the same as the Client.
    "ClientCredentials": {
        class: "organizationalRole",
        id: "cn",
        source: "common",
    }
};
```

The LDAP Provider allows the IDP to use different directories as sources for
OIDC data. All data sources must be named in the ```directory```-configuration.
the keys of the connections must match the values used as source in the
configuration section ```directoryOrganisation```.

For each ```directory``` configured as a data source, LDAP OIDC will keep
a separate connection open.

The following configurations are required for a data source:

*   url - an ```ldap``` or ```ldaps``` URL to the directory host.
*   base - the base DN for querying the system.
*   bind - the bind DN for connecting to the directory.
*   password - the bind password for connecting to the directory.

The following example illustrates the configuration of two connections.

**Note**: All records for one data type must be kept in one directory. The LDAP
provider does not support partitioned user bases across directories.

```
module.exports.directory = {
    common: {
        url: "ldap://server1:389",
        bind: "cn=oidc,ou=configurations,dc=local,dc=dev",
        base: "dc=local,dc=dev",
        password: "oidc"
    },
    federation: {
         url: "ldap://server2:389",
         bind: "cn=oidc,ou=services,dc=foo,dc=bar",
         base: "dc=local,dc=foo",
         password: "foobar"
    }
};
```

LDAP Provider acknowledges that identity management in different organizations
is based on different schemas. This implementation allows administrators to
create their own mappings from LDAP to OIDC user profiles.

The core mappings work fine with the [provided LDAP schemas](schemas). In order
to work with custom local schemas, it is required to customize the mapping rules
in the [```provider/mapping```](provider/mapping) directory.

#### Generating cryptographic keys

The OIDC provider relies on JWK keys. Therefore, any OpenSSL keys must be
converted to JWK. For this purpose you can use the ```pem2jwk.js``` tool in the
tools folder.

The tool will read PEM keys and output them as JWK.

```
node pem2jwk.js private.pem > private.jwk
```

Alternatively one can generate fresh RSA keys using the ```mkjwk.js``` tool in
the tools folder.

```
node mkjwk.js 2048 > private.jwk
```

The above command Will generate a new 2048 bit private RSA key.

### Manage OAuth2 and OIDC Services in a LDAP Directory

This provider is designed for a federation of registered clients. This
federation can get managed in a LDAP directory. The LDAP provider requires
these clients to get mapped into the internal data structure for the underlying
OIDC provider.   

### LDAP Settings

### Persistency Storage

The LDAP OIDC Provider has two layers of Persistency.

1.  A LDAP directory
2.  A REDIS data store

The LDAP directory is used for long lived and centrally managed resources,
such as accounts and services.

The REDIS data store provides persistency for short lived and temporary
information, such as user sessions and service auth tokens.

Service administrators may decide on which component they use for what kind of
information.

## Web Server Configuration

It is recommended to mask the OIDC provider behind a web-server/proxy server.

### Apache Configuration

On Apache 2.4 one needs to activate the proxy module and using the
[ProxyPass](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxypass)
configuration that points to the configured port on the installation server.