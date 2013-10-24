Collection of scripts to liberate your data from the cloud services.

# Using

$ npm install -g liberate-me
$ liberate-me dump-config > libme.json
$ $EDITOR libme.json
$ liberate-me libme.json target/

Run incremental backup on target/

# Supported services

- Trello
- ...

# Contributing

- all configuration should be done in libme.json.sample and include commented example that ships with this repository
- name of the backend needs to match config subsection

# TODO

- tests/travis
- testing guidelines

- add https://github.com/iElectric/titanpad-backup-tool/blob/master/titanpad_backup.sh
- add google services
- add https://github.com/ajaxorg/node-github
- syncing data is really hard - how do we detect something was deleted?
