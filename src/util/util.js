import axios from 'axios';

import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/pl';

export const api = axios.create({
    baseURL: `http://localhost:5000`
  });

dayjs.extend(objectSupport);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);
dayjs.locale('pl')
dayjs.tz.setDefault("Europe/Warsaw")

export const dayjsExtended = dayjs