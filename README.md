# Customer manager app

Check out working app on [customer-manager-client.herokuapp.com/](https://customer-manager-client.herokuapp.com/).

## Description
Main goal is to allow customer to book time slots in a service provider. First idea was to create app for customers of beauty salon run by one person, but overall look is to be more generic. Important feature is that available services have different durations, so available time slots have to be calculated accordingly. Interval length can be change in app settings.

### Functionalities - user
User account is created by following 'register' link.
User can:
- book and manage its appointments,
- manage its personal data.

### Functionalities - admin
Admin privilege can be manually set in database in user data.
Admin additionally can:
- browse and manage all appointments in 'calendar' look,
- change app settings (available days of the week, available hours and interval for time slots),
- look through database through convenient interface.

## Cloning app
By default backend url is set to http://localhost:5000 (default flask development settings).
Set REACT_APP_API_HOST environmental variable in order to change it.

Backend app is avaiable on https://github.com/Albatros-code/customer-manager-backend.git.
