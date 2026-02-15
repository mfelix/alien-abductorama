// ============================================
// RESOURCE PIPELINE
// Cross-zone energy transfers with transit loss
// and delivery delay. First slice: energy only.
// ============================================

class ResourcePipeline {
    constructor() {
        this.transfers = [];
    }

    // Initiate a transfer from one zone to another.
    // Immediately deducts from source zone energy.
    // After delay, credits destination (minus transit loss).
    routeResources(fromZone, toZone, type, amount) {
        const CC = COMMAND_CONFIG.RESOURCE;

        // Validate
        if (!fromZone || !toZone) return false;
        if (amount < CC.MIN_TRANSFER) return false;
        if (amount > CC.MAX_TRANSFER) amount = CC.MAX_TRANSFER;

        // Safety floor check
        if (fromZone.crewUfo.energy - amount < CC.SAFETY_FLOOR) {
            amount = fromZone.crewUfo.energy - CC.SAFETY_FLOOR;
            if (amount < CC.MIN_TRANSFER) return false;
        }

        // Deduct from source immediately
        fromZone.crewUfo.energy -= amount;

        // Calculate delivered amount (after transit loss)
        const delivered = Math.floor(amount * (1 - CC.TRANSIT_LOSS));

        // Create transfer record
        this.transfers.push({
            from: fromZone.id,
            to: toZone.id,
            type: type,
            amount: delivered,
            originalAmount: amount,
            delay: CC.TRANSIT_DELAY,
            elapsed: 0,
            particles: []
        });

        return true;
    }

    // Advance all in-flight transfers. Deliver when ready.
    update(dt, zones) {
        for (let i = this.transfers.length - 1; i >= 0; i--) {
            const transfer = this.transfers[i];
            transfer.elapsed += dt;

            if (transfer.elapsed >= transfer.delay) {
                // Deliver to destination zone
                const destZone = zones.find(z => z.id === transfer.to);
                if (destZone) {
                    const newEnergy = destZone.crewUfo.energy + transfer.amount;
                    destZone.crewUfo.energy = Math.min(destZone.crewUfo.maxEnergy, newEnergy);
                }

                // Remove completed transfer
                this.transfers.splice(i, 1);
            }
        }
    }

    // Returns active transfers for rendering flow particles
    getActiveTransfers() {
        return this.transfers;
    }

    // Cancel a specific in-flight transfer (refund to source)
    cancelTransfer(index, zones) {
        if (index < 0 || index >= this.transfers.length) return false;

        const transfer = this.transfers[index];
        const sourceZone = zones.find(z => z.id === transfer.from);
        if (sourceZone) {
            sourceZone.crewUfo.energy = Math.min(
                sourceZone.crewUfo.maxEnergy,
                sourceZone.crewUfo.energy + transfer.originalAmount
            );
        }

        this.transfers.splice(index, 1);
        return true;
    }
}
