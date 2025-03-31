// components/Post_components/RepostCount.jsx
import React from "react";
import PropTypes from "prop-types";

function RepostCount({ count }) {
  return (
    <span className="repost-count" aria-label={`Retweeted ${count} times`}>
      {`(${count})`}
    </span>
  );
}

RepostCount.propTypes = {
  count: PropTypes.number.isRequired,
};

export default RepostCount;