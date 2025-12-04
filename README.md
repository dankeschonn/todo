## Summary

Codebase for a fully fucntional  CRUD app that takes input from a user and displays all entries in a list. 
Once an entry is made all open instances of the app updates in real time via websockets.

Deployed [here](https://todo.promo). (Inital load may take ~50s on free tier from vendor)

## Stack

* Client - [NextJS](https://nextjs.org/)
* Database - PostgreSQL - [Neon](https://neon.com/)
* ORM - [Prisma](https://prisma.com)
* Message Queue - RabbimtMQ - [CloudAMQP](https://www.cloudamqp.com/) (prod), [Docker](https://docker.com) (dev)
* Worker - Node - [Railway](https://railway.com)
* Websocket - [Pusher](https://pusher.com)


## Run locally
* Install npm packages in folders `/todo_app` and `/worker` individually
* Run `npm run dev` in separate terminals in each folder
