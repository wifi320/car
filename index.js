/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
const APP_ID = process.env.APP_ID;
const contentful = require('contentful').createClient({
  space: process.env.SPACE,
  accessToken: process.env.TOKEN
})

const languageStrings = {
  'en': {
    translation: {
      JOKE_START: 'Here\'s a joke about',
      SPORT_NOT_FOUND: 'Sorry, I couldn\'t find a joke about',
      HELP_MESSAGE: 'Tell me a sport',
      STOP_MESSAGE: 'I\'ll stop now'
    }
  }
}

const handlers = {
  'Joke': function() {
    // Get a random space fact from the space facts list
    // Use this.t() to get corresponding language data
    const sport = this.event.request.intent.slots.sport.value
    console.log(sport)
    contentful.getEntries({
      "content_type": 'joke',
      "fields.sport.sys.contentType.sys.id": 'sport',
      "fields.sport.fields.name[match]": sport
    }).then((response) => {
      if (response.items.length) {
        let joke = response.items[Math.floor(Math.random() * response.items.length)]
        this.emit(':tell', `${this.t('JOKE_START')} ${sport}: ${joke.fields.body}`);
      } else {
        contentful.getEntries({"content_type": 'joke',}).then((response) => {
          let joke = response.items[Math.floor(Math.random() * response.items.length)]
          let _sport = joke.fields.sport.fields.name
          this.emit(':tell', `${this.t('SPORT_NOT_FOUND')} ${sport}, but ${this.t('JOKE_START')} ${_sport}: ${joke.fields.body}`);
        })
      }
    })
  },
  'AMAZON.HelpIntent': function() {
    const speechOutput = this.t('HELP_MESSAGE');
    const reprompt = this.t('HELP_MESSAGE');
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.StopIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'SessionEndedRequest': function () {
      console.log('SessionEndedRequest')
  },
  'Unhandled': function() {
      console.log('Unhandled')
  }
};

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
