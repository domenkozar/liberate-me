[![Build Status](https://secure.travis-ci.org/iElectric/liberate-me.png?branch=master)](http://travis-ci.org/iElectric/liberate-me) [![Coverage Status](https://coveralls.io/repos/iElectric/liberate-me/badge.png)](https://coveralls.io/r/iElectric/liberate-me) [![NPM version](https://badge.fury.io/js/liberate-me.png)](http://badge.fury.io/js/liberate-me)

Collection of scripts to liberate your data from the cloud services. Serves two purposes:

- backup of your data in case of X
- offline access to your data

# Usage

    $ npm install -g liberate-me
    $ liberate-me dump-config > libme.json
    $ $EDITOR libme.json
    $ liberate-me libme.json target/

NOTE: After successful retrieval, run incremental backup job on `target/` directory.

# Supported services

- Trello
- ... add your own

# Contributing

- all configuration should be done in `libme.json.sample` and include commented example that ships with this repository
- name of the backend needs to match config subsection
- test coverage

# TODO

- strip comments from JSON config: https://npmjs.org/package/jsonminify
- testing guidelines
- be able to specify json schema for services
- add https://github.com/iElectric/titanpad-backup-tool/blob/master/titanpad_backup.sh
- add google services
- add gmail: https://github.com/ditesh/node-poplib/blob/master/demos/retrieve-all.js
- add https://github.com/ajaxorg/node-github
- syncing data is really hard - how do we detect something was deleted?
