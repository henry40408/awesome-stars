import React from 'react';
import { Flex, Box } from 'reflexbox';

const AccessTokenForm = () => (
  <Flex>
    <Box w={4 / 5}><input type="text" /></Box>
    <Box w={1 / 5}><input type="submit" value="Save" /></Box>
  </Flex>
);

export default AccessTokenForm;
