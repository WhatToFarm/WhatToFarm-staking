// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "./token/BEP20/BEP20.sol";

contract TestToken is BEP20 {
    constructor() BEP20 ("testToken", "TST") {
    }
}