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
 
# Core Principles
* Frameworks – There’s a lot of moving parts to Powerline, so we should try to be modular and use frameworks and well-known technologies whenever possible
* Streamlined experience – The user experience (citizen or leader) should flow effortlessly, beautifully, and naturally for a simple, streamlined experience.
* Mission first – Powerline exists to strengthen democracy, civic engagement, and civil society. Any major feature that does that directly will likely be put in the free tier by the core team. Any major feature that can help generate revenue without putting our mission at risk (or sacrificing our values of accessibility, accountability, integrity, privacy, or people) will likely be put into a Silver or above tier.
* Simplifying civic engagement – All features, UI, and UX should make engagement easier for the user (citizen or leader) whenever possible. Pre-fill the field automatically, reduce the number of steps, etc.
* Strengthening leader-community relationships – A leader could be positional (e.g. mayor, director, etc.) or organic (some citizen or group member), but the relationship between a leader and a community is fundamentally different than one community member to another. The concepts of leadership, communities, and the relationships between the two should always be kept in mind in the development of new features.
* Communication is key - Join us on Slack, create an issue, whatever it takes to communicate. Let’s work together!
