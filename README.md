![Discourse from scratch](https://guides.nanobox.io/assets/quickstart-icons/discourse.png)

# Discourse from scratch

This is a Discourse application that is configured and ready to run locally, or be deployed to production, using Nanobox.

## Download Nanobox

To get started you'll first need to download Nanobox. You can do this from the Nanobox dashboard after creating a free Nanobox account.

<a href="https://nanobox.io/download"><img src="https://guides.nanobox.io/assets/quickstart-icons/download.png" /></a>

## Clone the repo

```bash
# clone the code
git clone https://github.com/nanobox-quickstarts/nanobox-discourse.git

# cd into the discourse app
cd nanobox-discourse
```

## Run Discourse Locally

First, add a convenient way to access your app from the browser and then drop into a Nanobox development console:

```bash
# add a local DNS alias
nanobox dns add local discourse.dev

# drop into a nanobox development console
nanobox run
```

From inside the Nanobox console you'll run data migrations, create a new admin user, and start your app:

```bash
# run migrations
rake db:migrate

# create an admin user
rake admin:create

# start your application
rails s
```

Visit your app at <a href="http://discourse.dev" target="\_blank">discourse.dev</a>

## Stage Discourse Locally (optionl)

Nanobox allows you to stage your application locally before deploying to production. This `dry-run` environment simulates your app's production environment. If it works here, it will work in production...

### Add Necessary Environment Variables

To simulate the application running in a production environment, rails needs to be told to run in production mode:

```bash
nanobox evar add dry-run RAILS_ENV=production
```

### "Deploy"

Deploy your applicaiton to the local staging environment:

```bash
nanobox deploy dry-run
```

## Deploy Discourse to Production

To deploy Discourse to production with Nanobox you'll need to [launch a new application](https://docs.nanobox.io/workflow/launch-app/).

Once your new app is up-and-running you can [link](https://docs.nanobox.io/workflow/deploy-code/#add-your-live-app-as-a-remote) this codebase to your running application:

```bash
nanobox remote add <your-new-apps-name>
```

### Add Necessary Environment Variables

Before you deploy you'll need to add (at least) the following evars:

* DISCOURSE_HOSTNAME=www.your-site.com
* RAILS_ENV=production

If you want to send mail you'll need to add these evars:

* DISCOURSE_SMTP_ADDRESS
* DISCOURSE_SMTP_PORT
* DISCOURSE_SMTP_DOMAIN
* DISCOURSE_SMTP_USER_NAME
* DISCOURSE_SMTP_PASSWORD

Evars can either be added via Nanobox Desktop or Nanobox Dashboard *([See our docs](https://docs.nanobox.io/app-config/environment-variables/#custom-environment-variables))*.

### Deploy

Then, simply deploy:

```
nanobox deploy
```

Once your deploy is complete you should be able to view your application online.

<a href="https://nanobox.io"><img src="https://guides.nanobox.io/assets/quickstart-icons/footer.png" /></a>
