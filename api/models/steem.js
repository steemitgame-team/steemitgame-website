'use strict';

import sc2 from '../lib/sc2';
import base58 from 'bs58';
import getSlug from 'speakingurl';
import secureRandom from 'secure-random';

exports.comment = function(accessToken, parentAuthor, parentPermlink, author, content, permlink, tag) {
    let operations = [];
    let metaData = {
        community: tag,
        tags: [tag],
        app: `steemgg.app/test`
    };
    let commentOp = [
        'comment',
        {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author: author,
            permlink: permlink,
            title: "",
            body: content,
            json_metadata: JSON.stringify(metaData)
        },
    ];
    operations.push(commentOp);
    let result = sc2.instance.broadcast(accessToken, operations);
    return result;
}

exports.post = function(accessToken, author, title, content, reward, tags, permlink, tag){
    let extensions = [[0, {
        beneficiaries: [
            {
                account: 'steemgg',
                weight: 2500
            }
        ]
    }]];

    let operations = [];

    let metaData = {
        community: tag,
        tags: tags,
        app: `steemgg.app`
    };

    let commentOp = [
        'comment',
        {
            parent_author: "",
            parent_permlink: tag,
            author: author,
            permlink,
            title: title,
            body: content,
            json_metadata: JSON.stringify(metaData)
        },
    ];
    operations.push(commentOp);

    let commentOptionsConfig = {
        author: author,
        permlink,
        allow_votes: true,
        allow_curation_rewards: true,
        extensions,
    };

    if (extensions) {
        commentOptionsConfig.extensions = extensions;

        if (reward === '100') {
            commentOptionsConfig.percent_steem_dollars = 0;
        } else {
            commentOptionsConfig.percent_steem_dollars = 10000;
        }

        commentOptionsConfig.max_accepted_payout = '1000000.000 SBD';

        operations.push(['comment_options', commentOptionsConfig]);
    }

    let result = sc2.instance.broadcast(accessToken, operations);
    return result;
}

exports.me = async function(accessToken) {
    let user = await sc2.instance.me(accessToken);
    return user;
}

exports.getLoginUrl = async function() {
    let url = await sc2.instance.getLoginURL('hello');
    return url;
}

exports.revokeToken = async function(accessToken) {
    let result = await sc2.instance.revokeToken(accessToken);
    return result;
}

exports.getToken = async function(code) {
    let result = await sc2.instance.getToken(code);
    return result;
}

exports.refreshToken = async function(refreshToken) {
    let result = await sc2.instance.refreshToken(refreshToken);
    return result;
}

exports.vote = async function(accessToken, voter, author, permlink, weight) {
    let result = await sc2.instance.vote(accessToken, voter, author, permlink, weight);
    return result;
}

exports.claimRewardBalance = async function(accessToken, account, rewardSteem, rewardSbd, rewardVests) {
    let result = await sc2.instance.claimRewardBalance(accessToken, account, rewardSteem, rewardSbd, rewardVests);
    return result;
}

exports.createPermlink = function(title, author) {
    let permlink;
    let prefix;
    let s = slug(title);
    if (s === '') {
        s = base58.encode(secureRandom.randomBuffer(4));
    }
    prefix = `${base58.encode(secureRandom.randomBuffer(4))}-`;
    permlink = prefix + s;
    return checkPermLinkLength(permlink);
}

exports.createCommentPermlink = function(parentAuthor, parentPermlink) {
    let permlink;
    const timeStr = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '');
    const newParentPermlink = parentPermlink.replace(/(-\d{8}t\d{9}z)/g, '');
    permlink = `re-${parentAuthor}-${newParentPermlink}-${timeStr}`;
    return checkPermLinkLength(permlink);
};

function checkPermLinkLength(permlink) {
  if (permlink.length > 255) {
    permlink = permlink.substring(permlink.length - 255, permlink.length);
  }
  permlink = permlink.toLowerCase().replace(/[^a-z0-9-]+/g, '');
  return permlink;
}

function slug(text) {
  return getSlug(text.replace(/[<>]/g, ''), { truncate: 128 });
}
