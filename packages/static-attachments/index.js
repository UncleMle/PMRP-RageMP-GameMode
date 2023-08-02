function serializeAttachments(attachments)
{
	return (attachments.map((hash) => (hash.toString(36)))).join("|");
}

function _addAttachment(entity, attachmentHash, remove)
{
	let idx = entity._attachments.indexOf(attachmentHash);

	if(idx === -1)
	{
		if(!remove)
		{
			entity._attachments.push(attachmentHash);
		}
	}
	else if(remove)
	{
		entity._attachments.splice(idx, 1);
	}

	entity.setVariable("attachmentsData", serializeAttachments(entity._attachments));
}

function _addAttachmentWrap(attachmentName, remove)
{
	let to = typeof(attachmentName);

	if(to === "number")
	{
		_addAttachment(this, attachmentName, remove);
	}
	else if(to === "string")
	{
		_addAttachment(this, mp.joaat(attachmentName), remove);
	}
}

function _hasAttachment(attachmentName)
{
	return this._attachments.indexOf((typeof(attachmentName) === 'string') ? mp.joaat(attachmentName) : attachmentName) !== -1;
}

mp.events.add("playerJoin", (player) =>
{
	player._attachments = [];

	player.addAttachment = _addAttachmentWrap;
	player.hasAttachment = _hasAttachment;
});

mp.events.add("staticAttachments.Add", (player, hash) =>
{
	player.addAttachment(parseInt(hash, 36), false);
});

mp.events.add("staticAttachments.Remove", (player, hash) =>
{
	player.addAttachment(parseInt(hash, 36), true);
});

mp.events.add('removeAttachments', (player) => {
	player._attachments = [];

	player.addAttachment = _addAttachmentWrap;
	player.hasAttachment = _hasAttachment;
})