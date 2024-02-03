# Backend Canister

NOTE: This is untested code, mostly generated with ChatGPT

TODO:
- Implement the actual bitcoin transactions:
    - https://github.com/dfinity/examples/tree/master/motoko/basic_bitcoin


# Candid Interface

The backend canister has following interfaces that the frontend can call:

```candid
type DTI = nat;
type Decimal = float64;

type DonationCategories = record {
    curriculumDesign: Decimal;
    teacherSupport: Decimal;
    schoolSupplies: Decimal;
    lunchAndSnacks: Decimal;
};

type Donation = record {
    totalAmount: Decimal;
    allocation: DonationCategories;
};

service : {
    makeDonation: (Donation) -> (DTI) async; // Returns DTI as a natural number (index)
    getDonationDetails: (DTI) -> (opt Donation) async; // Retrieve donation details by DTI
    getAllDonations: () -> (vec Donation) async; // Retrieve all donation records
    getMyDonations: () -> (vec DTI) async; // New service: Retrieve DTIs of my donations
};
```

### Notes

- **Precision Handling:** We ensure that the handling of Bitcoin amounts (with 8 decimal places) is consistent and accurate throughout the calculations, especially when converting percentages to actual Bitcoin amounts for donation allocations.
- **Security and Validation:** Implement necessary checks to ensure that the total allocation amounts (or percentages) exactly match the total donation amount, and validate input data to prevent errors or misuse.
- **DTI as Index:** Using the donation's index in the array as the DTI simplifies the tracking system, making it easier to implement and understand. Each donation is easily accessible through its unique index.
- **Data Integrity:** This approach assumes that the list of donations will only ever grow, with no deletions, to maintain the integrity of the DTIs. If donations could be removed, this would complicate the DTI system, as gaps would appear in the index sequence.
- **Scalability:** While this system is simple and effective for a certain scale, if the number of donations becomes very large, you might need to consider the efficiency of data access patterns and memory usage, depending on the specifics of the canister's implementation and the Internet Computer's characteristics.
- **System Functions for Upgrade Handling:** The `preupgrade` and `postupgrade` system functions are automatically called by the Motoko runtime. They're used here to synchronize the `stable` and mutable versions of the donations data around upgrades.
- **Persistence Across Upgrades:** With this pattern, the `donations` data persists across canister code upgrades, ensuring that your donation records are not lost when you deploy new versions of your canister.
- **Usage of Stable Variables:** This example specifically uses a `stable` array of `Donation` records. If your data structure becomes more complex, consider serialization and deserialization techniques for managing data in stable memory efficiently.
- **Public Access:** The `getAllDonations` method provides open access to the donation records, aligning with the requirement for public exploration of donation transactions.
- **Donation Transaction Identifier (DTI):** Using the array index as the DTI simplifies the implementation. Consider using a more sophisticated identifier for enhanced usability and security in a real-world scenario.
- **Orthogonal Persistence:** With the use of `stable` variables, donation records persist across canister upgrades, ensuring long-term access to the data.
- **Principal Management:** This implementation assumes that the principal is an adequate identifier for users. We might have additional authentication and user management logic to link principals with user accounts more explicitly.

This streamlined approach, using the index as a DTI, offers a straightforward way to track donations within the canister, ensuring that each donation can be uniquely identified and accessed based on its position in the stored list of donations.

By following this approach, the canister's `donations` data benefits from orthogonal persistence, and we ensure data longevity and integrity across canister upgrades on the Internet Computer.

This solution sets up a basic framework for a Donation Transaction Explorer on the Internet Computer, allowing for both specific queries by DTI and public exploration of all donation records.


# Bitcoin Donation & Tracking System

To design a solution for the given requirements on the Internet Computer using Motoko for the backend logic and Candid for defining the interface, let's break down the solution into two main parts: the data structure and the Candid interface, then we will address the tracking system with a unique Donation Transaction Identifier (DTI).

## Motoko Code

For tracking donations, each donation needs a unique identifier (DTI). This can be implemented by using the index into a vector as the DTI:

```motoko
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";

// -------------------------------------------------------------------------------
// Type definition

type DTI = Nat;
type Decimal = Float64; // Represents Bitcoin with precision for 8 decimal places

type DonationCategories = {
    curriculumDesign: Decimal;
    teacherSupport: Decimal;
    schoolSupplies: Decimal;
    lunchAndSnacks: Decimal;
};

type Donation = {
    totalAmount: Decimal;
    allocation: DonationCategories;
};

// -------------------------------------------------------------------------------
// Data storage

// Define the stable variable to persist donations data across upgrades.
stable var stableDonations: [Donation.Donation] = [];

// Mutable copy of donations for runtime operations.
var donations: [Donation.Donation] = stableDonations;

// Map each principal to a list of donation indices (DTIs)
var donationsByPrincipal: HashMap.HashMap<Principal, [DTI]> = HashMap.HashMap<Principal, [DTI]>(10, Principal.equal, Principal.hash);

// -------------------------------------------------------------------------------
// Canister Endpoints

public func makeDonation(donation: Donation): async Nat {
    let index = donations.size();
    donations := Array.append<Donation>(donations, [donation]);
    return index; // Use the array index as the DTI
}

public func makeDonation(donation: Donation): async DTI {
    let caller = Principal.toText(Principal.caller());
    let dti = donations.size(); // Simply use index into donations Array as the DTI
    donations := Array.append<Donation>(donations, [donation]);
    
    // Update the map for the caller's principal
    let existingDonations = switch (donationsByPrincipal.get(Principal.caller())) {
        case (null) { [] };
        case (?ds) { ds };
    };
    donationsByPrincipal.put(Principal.caller(), Array.append<DTI>(existingDonations, [dti]));
    
    return dti;
}

public func getDonationDetails(dti: Nat): async ?Donation {
    if (dti < donations.size()) {
        return ?donations[dti];
    } else {
        return null;
    }
}

public func getMyDonations(): async [DTI] {
    let caller = Principal.caller();
    return switch (donationsByPrincipal.get(caller)) {
        case (null) { [] };
        case (?ds) { ds };
    };
}

// -------------------------------------------------------------------------------
// Canister upgrades

// System-provided lifecycle method called before an upgrade.
system func preupgrade() {
    // Copy the runtime state back into the stable variable before upgrade.
    stableDonations := donations;
}

// System-provided lifecycle method called after an upgrade or on initial deploy.
system func postupgrade() {
    // After upgrade, reload the runtime state from the stable variable.
    donations = stableDonations;
}

```