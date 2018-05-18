import { configure } from '@storybook/react';

function loadStories() {
    require('../app/stories/index');
}

configure(loadStories, module);
