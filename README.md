# Introduction
Powerline is an open, social, streamlined mobile app and web platform that makes it easier for people to change their world through individual or collective action at the local and global levels. Think of it as Twitter/Yammer for democracy or as a community network for civil society (a.k.a. the non-profit and activist space).

## Open Source
Powerline is now open source under the AGPLv3 license. Powerline runs as a SaaS application – there is a free “mission” tier as well as paid upgrade plans. By contributing to Powerline, you’re making a difference for a fun open source project with a real world-changing mission.

##API Reference Documentation
Please contact @jterps08 or @austinpapp

## Contributing
Want to help build an amazing product? There’s a lot happening with Powerline and we welcome help wherever we can get it. Help build a new feature, improve the user experience, or contribute to our marketing efforts.

Here’s how to get started:
* Introduce yourself to the team in our GitHub 
* Understand our core principles
* Take a look at our open Issues
* Fork us
* Work with @jterps08 or @austinpapp on the issue on a separate branch
* Submit your pull request and we'll merge it and deploy in the next release

Powerline is built with the following technologies:
* Backend Server: LAMP stack, Symfony2, Doctrine2, RabbitMQ 
* Mobile Apps: PhoneGap, AngularJS, Ionic
* Frontend Web: AngularJS

## Branching
Our branching strategy is straightforward and well documented . For a detailed look please see [A successful Branching Model](http://nvie.com/posts/a-successful-git-branching-model/). 

### Branches
* develop - Our main branch for all features
* master - Production ready code
* feature - Your feature branch (temporary branch)
* release-*, hotfix-* - temporary branches 

## Documentation
**Work in progress. Please help us build our documentation!**

## Installation

* install node.js, e.g. on macos `brew install node`
* `sudo npm install -g cordova`
* `sudo npm install -g ionic`
* copy powerline config file, e.g. when you want to connect to development backend, run `cp www/config/dev.js www/js/config.js`
* `ionic serve` -- powerline mobile app should launch in web browser
 
