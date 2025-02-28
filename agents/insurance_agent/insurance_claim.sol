// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InsuranceClaims {
    struct Claim {
        string camUid;
        string camImageUrl;
        string description;
    }

    Claim[] private claims;

    event ClaimSubmitted(
        uint256 indexed claimId,
        string camUid,
        string camImageUrl,
        string description
    );

    function submitClaim(
        string memory _camUid,
        string memory _camImageUrl,
        string memory _description
    ) public {
        claims.push(Claim(_camUid, _camImageUrl, _description));
        emit ClaimSubmitted(
            claims.length - 1,
            _camUid,
            _camImageUrl,
            _description
        );
    }

    function getAllClaims() public view returns (Claim[] memory) {
        return claims;
    }
}
