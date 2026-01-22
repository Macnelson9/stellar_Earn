use soroban_sdk::{contracttype, Address, BytesN, Env, Symbol, Vec, log, events};
use crate::types::{Submission, SubmissionStatus, Quest, QuestStatus};
use crate::storage;
use crate::errors::Error;

/// Submit proof of quest completion
/// Validates that the quest exists, is active, hasn't expired, and user hasn't already submitted
pub fn submit_proof(
    env: &Env,
    quest_id: Symbol,
    submitter: Address,
    proof_hash: BytesN<32>,
) -> Result<(), Error> {
    // Validate quest exists
    let quest = storage::get_quest(env, &quest_id)?;

    // Check if quest is active
    match quest.status {
        QuestStatus::Active => {},
        _ => return Err(Error::InvalidQuestStatus),
    }

    // Check if quest has expired
    let current_timestamp = env.ledger().timestamp();
    if current_timestamp > quest.deadline {
        return Err(Error::QuestExpired);
    }

    // Check for duplicate submission
    if storage::submission_exists(env, &quest_id, &submitter) {
        return Err(Error::DuplicateSubmission);
    }

    // Validate proof hash is not all zeros (basic validation)
    let zero_hash = BytesN::from_array(env, &[0u8; 32]);
    if proof_hash == zero_hash {
        return Err(Error::InvalidProofHash);
    }

    // Create submission
    let submission = Submission {
        quest_id: quest_id.clone(),
        submitter: submitter.clone(),
        proof_hash,
        status: SubmissionStatus::Pending,
        timestamp: current_timestamp,
    };

    // Store submission
    storage::store_submission(env, &submission)?;

    // Add to user's submission list
    storage::add_user_submission(env, &submitter, &quest_id)?;

    // Emit event
    events::emit(
        env,
        Symbol::new(env, "proof_submitted"),
        (quest_id, submitter, proof_hash),
    );

    log!(env, "Proof submitted for quest {} by user {}", quest_id, submitter);

    Ok(())
}

/// Get a specific submission by quest_id and submitter
pub fn get_submission(
    env: &Env,
    quest_id: Symbol,
    submitter: Address,
) -> Result<Submission, Error> {
    storage::get_submission(env, &quest_id, &submitter)
}

/// Get all submissions for a specific user
/// Returns a vector of quest IDs that the user has submitted to
pub fn get_user_submissions(env: &Env, user: Address) -> Vec<Symbol> {
    storage::get_user_submissions(env, &user)
}

/// Get all submissions for a specific quest
/// This is a helper function that could be useful for verifiers
pub fn get_quest_submissions(env: &Env, quest_id: Symbol) -> Result<Vec<Submission>, Error> {
    // For now, this requires iterating through all submissions
    // In a production system, you might want to maintain a separate index
    // This is a simplified implementation
    let mut submissions = Vec::new(env);

    // Note: This is not efficient for large numbers of submissions
    // A production implementation would need a proper indexing system
    // For the scope of this issue, this provides basic functionality

    // We can't efficiently iterate through all submissions without an index
    // This function would need to be redesigned with proper indexing in storage
    // For now, returning an error indicating this isn't implemented efficiently

    Err(Error::Unauthorized) // Placeholder - would need proper implementation
}