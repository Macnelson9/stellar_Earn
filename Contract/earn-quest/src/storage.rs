use soroban_sdk::{Address, Env, Symbol, Map, Bytes, Vec};
use crate::types::{Submission, Quest};
use crate::errors::Error;

/// Generate a unique submission key from quest_id and submitter
/// Uses Bytes to create a composite key that's more efficient than string concatenation
pub fn submission_key(env: &Env, quest_id: &Symbol, submitter: &Address) -> Bytes {
    let mut key = Bytes::new(env);
    key.extend_from_slice(&quest_id.to_val().to_be_bytes());
    key.extend_from_slice(&submitter.to_val().to_be_bytes());
    key
}

/// Store a submission
pub fn store_submission(env: &Env, submission: &Submission) -> Result<(), Error> {
    let key = submission_key(env, &submission.quest_id, &submission.submitter);
    env.storage().instance().set(&key, submission);
    Ok(())
}

/// Get a submission by quest_id and submitter
pub fn get_submission(env: &Env, quest_id: &Symbol, submitter: &Address) -> Result<Submission, Error> {
    let key = submission_key(env, quest_id, submitter);
    env.storage().instance().get(&key)
        .ok_or(Error::SubmissionNotFound)
}

/// Check if a submission exists
pub fn submission_exists(env: &Env, quest_id: &Symbol, submitter: &Address) -> bool {
    let key = submission_key(env, quest_id, submitter);
    env.storage().instance().has(&key)
}

/// Store a quest
pub fn store_quest(env: &Env, quest: &Quest) -> Result<(), Error> {
    env.storage().instance().set(&quest.id, quest);
    Ok(())
}

/// Get a quest by ID
pub fn get_quest(env: &Env, quest_id: &Symbol) -> Result<Quest, Error> {
    env.storage().instance().get(quest_id)
        .ok_or(Error::QuestNotFound)
}

/// Check if a quest exists
pub fn quest_exists(env: &Env, quest_id: &Symbol) -> bool {
    env.storage().instance().has(quest_id)
}

/// Generate a user submissions key
pub fn user_submissions_key(env: &Env, user: &Address) -> Bytes {
    let mut key = Bytes::new(env);
    key.extend_from_slice(b"user_submissions_");
    key.extend_from_slice(&user.to_val().to_be_bytes());
    key
}

/// Add submission to user's submission list
pub fn add_user_submission(env: &Env, user: &Address, quest_id: &Symbol) -> Result<(), Error> {
    let user_key = user_submissions_key(env, user);

    let mut user_submissions: Vec<Symbol> = env.storage().instance()
        .get(&user_key)
        .unwrap_or(Vec::new());

    // Check for duplicates
    if !user_submissions.contains(quest_id) {
        user_submissions.push_back(*quest_id);
        env.storage().instance().set(&user_key, &user_submissions);
    }

    Ok(())
}

/// Get all quest IDs submitted by a user
pub fn get_user_submissions(env: &Env, user: &Address) -> Vec<Symbol> {
    let user_key = user_submissions_key(env, user);
    env.storage().instance()
        .get(&user_key)
        .unwrap_or(Vec::new())
}