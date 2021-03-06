### Version 0.8 (2017-06-21)

  - feat: add event for "annotation update"
  - fix: fix default Mongo host in CLI documentation

### Version 0.7.3 (2016-07-07)

  - fix: fix a bug that crashes the server in metadata tree management

### Version 0.7.2 (2016-06-10)

  - fix: fix "watch" timeout for subsequent clients

### Version 0.7.1 (2016-06-08)

  - fix: fix "watch" timeout
  - improve: return better HTTP status code
  - feat: add Python 3 support to functional tests
  - chore: update functional tests to rely on latest Python client
  - chore: move documentation to external dedicated repository

### Version 0.7 (2016-05-24)

  - feat: {corpus | medium | layer} metadata
  - feat: {corpus | medium | layer | queue } watch

### Version 0.6.1 (2016-02-23)

  - fix: support for `docker 1.10` and `docker-compose 0.6`

### Version 0.6 (2015-09-17)

  - feat: add permissions to queue
  - feat: non-destructive queue picking
  - feat: regular users can get the list of users and groups
  - feat: regular users can get the list of their groups
  - feat: admin users can remove any account but their own
  - feat: daily log rotation
  - feat: filter layers by {fragment|data}_type
  - feat: get number of annotations in a layer
  - feat: get number of media in a corpys
  - BREAKING: getting a queue no longer returns its elements (use new picking routes instead)
  - BREAKING: only admin users can create queues
  - BREAKING: queue push returns "success" message instead of queues
  - fix: delete medium annotations upon medium deletion

### Version 0.5.6 (2015-05-13)

  - fix: delete corpus after its layers and media are removed

### Version 0.5.4 (2015-05-12)

  - fix: fix a bug when checking for non-existing resource

### Version 0.5.3 (2015-05-07)

  - fix: fix a bug in .../annotation/... routes

### Version 0.5.2 (2015-05-05)

  - fix: increase POST limit to 50mb

### Version 0.5.1 (2015-04-30)

  - fix: only corpus administrators can create media
  - fix: only corpus readers can get list of media
  - doc: update Docker instructions

### Version 0.5 (2015-04-29)

  - major code refactoring
  - switch to ExpressJS 4
  - BREAKING CHANGE in external API
  - BREAKING CHANGE in internal database
  - wip: unit test
  - wip: documentation for Javascript and Python clients

### Version 0.4.1 (2015-02-03)

  - various code improvement
  - remove route /corpus/:corpus/medias
  - remove route /layer/:layer/annotations
  - update route POST /layer/:layer/annotation
  - defaults to no history (use ?history=ON to return history)
  - add filtering support for all GET routes

### Version 0.3.1 (2014-12-15)

  - bug fix release

### Version 0.2 (2014-12-08)

  - database overhaul
  - complete route refactoring

### Version 0.0.1 (2014-05-13)

  - first public release
