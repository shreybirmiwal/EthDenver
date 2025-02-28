// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InsuranceClaims
 * @notice This contract allows users to file an insurance claim automatically when a car crash is detected.
 * Claims include details such as an image reference, location, description, and an estimated damage cost.
 * An authorized insurer (the contract owner) can later approve or reject claims.
 */
contract InsuranceClaims {
    
    // Possible statuses for a claim
    enum ClaimStatus { Pending, Approved, Rejected }
    
    // Structure representing an insurance claim
    struct Claim {
        uint256 claimId;          // Unique identifier for the claim
        address claimant;         // Address of the person filing the claim
        uint256 filingTime;       // Time when the claim was filed (block timestamp)
        string imageReference;    // Reference to the evidence image (e.g., IPFS hash or URL)
        string location;          // Location where the incident occurred
        string description;       // Details provided by the claimant
        uint256 estimatedDamage;  // Estimated damage cost (in smallest currency units)
        ClaimStatus status;       // Current status of the claim
    }
    
    // Counter for the next claim ID
    uint256 public nextClaimId;
    
    // Mapping to store all claims by their ID
    mapping(uint256 => Claim) public claims;
    
    // Address of the contract owner (insurer or admin)
    address public owner;
    
    // Events for logging claim filing and status updates
    event ClaimFiled(uint256 indexed claimId, address indexed claimant, string imageReference, uint256 filingTime);
    event ClaimApproved(uint256 indexed claimId);
    event ClaimRejected(uint256 indexed claimId);
    
    // Modifier to restrict functions to the contract owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // Set the contract deployer as the owner
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Files a new insurance claim.
     * @param imageReference A reference to the crash image (IPFS hash or URL).
     * @param location The location where the incident occurred.
     * @param description A description of the incident.
     * @param estimatedDamage Estimated damage cost in the smallest currency units.
     * @return claimId The unique ID assigned to the newly filed claim.
     */
    function fileClaim(
        string memory imageReference,
        string memory location,
        string memory description,
        uint256 estimatedDamage
    ) public returns (uint256 claimId) {
        require(bytes(imageReference).length > 0, "Image reference is required");
        require(bytes(location).length > 0, "Location is required");
        require(bytes(description).length > 0, "Description is required");
        
        claimId = nextClaimId;
        nextClaimId++;
        
        // Create the claim struct and store it in the mapping
        claims[claimId] = Claim({
            claimId: claimId,
            claimant: msg.sender,
            filingTime: block.timestamp,
            imageReference: imageReference,
            location: location,
            description: description,
            estimatedDamage: estimatedDamage,
            status: ClaimStatus.Pending
        });
        
        // Emit an event to signal that a new claim has been filed
        emit ClaimFiled(claimId, msg.sender, imageReference, block.timestamp);
    }
    
    /**
     * @notice Approves a pending claim.
     * @param claimId The ID of the claim to approve.
     */
    function approveClaim(uint256 claimId) public onlyOwner {
        require(claims[claimId].claimant != address(0), "Claim does not exist");
        require(claims[claimId].status == ClaimStatus.Pending, "Claim is not pending");
        
        claims[claimId].status = ClaimStatus.Approved;
        emit ClaimApproved(claimId);
    }
    
    /**
     * @notice Rejects a pending claim.
     * @param claimId The ID of the claim to reject.
     */
    function rejectClaim(uint256 claimId) public onlyOwner {
        require(claims[claimId].claimant != address(0), "Claim does not exist");
        require(claims[claimId].status == ClaimStatus.Pending, "Claim is not pending");
        
        claims[claimId].status = ClaimStatus.Rejected;
        emit ClaimRejected(claimId);
    }
    
    /**
     * @notice Retrieves the details of a specific claim.
     * @param claimId The ID of the claim.
     * @return A Claim struct containing all details of the claim.
     */
    function getClaim(uint256 claimId) public view returns (Claim memory) {
        require(claims[claimId].claimant != address(0), "Claim does not exist");
        return claims[claimId];
    }
}
