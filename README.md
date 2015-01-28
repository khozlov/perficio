# Perficio

[![Build Status](https://travis-ci.org/khozlov/perficio.svg?branch=master)](https://travis-ci.org/khozlov/perficio)
[![Code Climate](https://codeclimate.com/github/khozlov/perficio/badges/gpa.svg)](https://codeclimate.com/github/khozlov/perficio)
[![Dependency Status](https://gemnasium.com/khozlov/perficio.svg)](https://gemnasium.com/khozlov/perficio)

A node app for creating achievement systems.

## Configuration

There is some configuration required to get the app up an running so here is a quick overview of what you need to watch out for.

The app is using [config](https://www.npmjs.com/package/config). In the simplest scenario this means that if you set your NODE_ENV to 'production', the app will load the configuration from config/production.json and plug the wholes (missing values) using contents of config/default.json (aka defaults). Same goes for test, development (default) and whatever other environment you can come up with.

The app will run on a port specified with the (suprise, suprise) `port` config variable.

You can configure database access using `mongoUri`, `mongoUser` and `mongoPassword` variables.

Currently authentication is handled with Google OAuth2 using [passport](http://passportjs.org). This means that you need to set yourself up with some OAuth2 credentials. To do this, you'll need to visit the [Google developers console](https://console.developers.google.com/project) and create yourself a new project. Then under 'APIs & Auth -> Credentials' you can create an OAuth Client ID. Choose 'Web application' as application type, put the domain(s) at which your app will be running into the 'AUTHORIZED JAVASCRIPT ORIGINS' box and your callback url(s) into the 'AUTHORIZED REDIRECT URIS'.
The last part should take the form of http://your-domain/mount-point/auth/google/callback if you don't won't to mess with the default OAuth2 routes I set up. More about the mount point below. To finish up don't forget to set the config variables (`googleClientId` and `googleClientSecret`) with the ones Google generated for you.

The app provides you with the option to mount it at a specific path, so you don't need to play with rewrites to much. This might be helpful if you want to make Perficio share a domain with some existing system. Anyway, I needed it, so here it is. Just set the `mountPoint` config variable appropriately or leave it blank if you don't need it (don't use '/' as the mount point).

Also, to properly configure passport the app needs to know what `domain` it's running under so don't forget to put it into the config.

If you don't want just anyone to have access to your app, you can specify a regex pattern (`userFilterRegexp`) that all new user emails will be matched against. Those who won't match won't join.

And last but not least set your own `sessionSecret` that will be used to encrypt session cookies. Your life may depend on it (well, maybe not but it's still a good idea).

## Author

Pawel Kozlowski <khozlov@gmail.com>

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2014-2015 Pawel Kozlowski
