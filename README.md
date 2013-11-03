Collection of scripts to liberate your data from the cloud services.

# Usage

    $ npm install -g liberate-me
    $ liberate-me dump-config > libme.json
    $ $EDITOR libme.json
    $ liberate-me libme.json target/

NOTE: Run incremental backup on target/

# Supported services

- Trello
- ...

# Contributing

- all configuration should be done in libme.json.sample and include commented example that ships with this repository
- name of the backend needs to match config subsection

# TODO

- strip comments from JSON config: https://npmjs.org/package/jsonminify
- https://npmjs.org/package/coveralls
- https://github.com/alex-seville/travis-cov
- testing guidelines
- use json schema to validate config?
- be able to specify json schema for services
- add https://github.com/iElectric/titanpad-backup-tool/blob/master/titanpad_backup.sh
- add google services
- add gmail: https://github.com/ditesh/node-poplib/blob/master/demos/retrieve-all.js
- add https://github.com/ajaxorg/node-github
- syncing data is really hard - how do we detect something was deleted?
