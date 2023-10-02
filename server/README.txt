
DEVELOPMENT MODE:
this is an express.js backend server for
1. handling any specifically-backend logic, etc.
in response to the requests from a frontend reverse proxy,
started by Vite dev server with HMR-enabled. 


PREVIEW-PRODUCTION MODE:
this is an express.js backend server for
1. serving production static files from the folder ../dist
2. handling backend logic (databases, RESTapis, etc.)


PRODUCTION MODE:
<--not implemented, but:
1. handling backend logic (databases, REST, etc.)
in response to the requets from a production-optimized
reverse proxy, such as Apache/Nginx servers -->