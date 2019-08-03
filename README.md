# homebridge-xbox-one

This fork also turns the xbox one off as well as on.

## Installation

Naturally...
```
npm install -g homebridge-xbox-one
```

## Configuration

Add this to your `~/.homebridge/config.json` as an accessory:
```
{
  "accessory": "Xbox",
  "name": "Xbox",
  "ipAddress": "<Xbox IP address>",
  "liveId": "<Xbox Live ID>"
}
```

## Getting your Xbox One's IP address

On your Xbox, go to Settings > Network > Network Settings > Advanced Settings

## Getting your Live ID

On your Xbox, go to Settings > System > Console info & updates and look under "Xbox Live device ID"
