import jsdom from 'jsdom';
import fetch from 'unfetch';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import path from 'path';
import * as dotenv from 'dotenv';
import '../../src/utils/dateLocale';

const dotEnvPath = path.resolve('.env.test');
dotenv.config({ path: dotEnvPath });

const noop = () => {};

configure({ adapter: new Adapter() });

global.document = jsdom.jsdom('<html><body></body></html>');
global.window = document.defaultView;
global.navigator = window.navigator;
global.fetch = fetch;
global.Logging = noop;
global.addEventListener = noop;

require.extensions['.svg', '.css', '.scss'] = noop; // eslint-disable-line
require.extensions['.png'] = noop;
