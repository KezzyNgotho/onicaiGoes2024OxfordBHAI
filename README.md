![Alt text](frontend/src/donation_frontend/assets/BitcoinDonationApp_banner.png)

[Try it out!]()

# The frontend & backend canisters

The dApp consists out of several canisters, and each canister is treated as a standalone project.

To deploy the complete dApp, follow instructions in the README files, in this order:

- backend/donation_canister/
- backend/donation_tracker_canister
- deaissemblyline_backend/model_creation_canister
- deaissemblyline_backend/frontend_creation_canister
- deaissemblyline_backend/aissembly_line_canister
- frontend

# Canisters we have deployed on the Internet Computer mainnet:
- donation_canister: ekral-oiaaa-aaaag-acmda-cai
- donation_tracker_canister: fj5jn-2qaaa-aaaag-acmfq-cai
- model_creation_canister: 4o25u-bqaaa-aaaai-acrha-cai
- frontend_creation_canister: 4j33a-miaaa-aaaai-acrhq-cai
- aissembly_line_canister: 6ugvi-7aaaa-aaaai-acria-cai
- frontend: 6tht4-syaaa-aaaai-acriq-cai

Add controllers to canisters as needed:
dfx canister update-settings YourCanisterName --add-controller PrincipalToAdd

e.g.
dfx canister update-settings aissembly_line_canister --add-controller chfec-vmrjj-vsmhw-uiolc-dpldl-ujifg-k6aph-pwccq-jfwii-nezv4-2ae

On mainnet:
dfx canister --network ic update-settings aissembly_line_canister --add-controller chfec-vmrjj-vsmhw-uiolc-dpldl-ujifg-k6aph-pwccq-jfwii-nezv4-2ae

Verify controllers with:
dfx canister info YourCanisterName

e.g.
dfx canister info aissembly_line_canister
