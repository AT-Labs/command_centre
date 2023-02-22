import React from 'react';
import PropTypes from 'prop-types';
import { times, slice, map } from 'lodash-es';

const AMOUNT_OF_VISIBLE_PAGES = 9;
const MIDDLE_PAGE_NUMBER = 5;

export const Pagination = (props) => {
    const { itemsTotal, currentPage, itemsPerPage } = props;

    if (!itemsTotal || !currentPage || !itemsPerPage) return null;

    const amountOfWholePages = Math.floor(itemsTotal / itemsPerPage);
    const pagesTotal = itemsTotal % itemsPerPage > 0 ? amountOfWholePages + 1 : amountOfWholePages;
    const pagesAll = times(pagesTotal, index => index + 1);

    if (pagesTotal < 2) return null;

    let pagesVisible = pagesAll;
    let arePagesNoLongerAtTheStart = false;
    let havePagesReachedTheEnd = true;

    if (pagesTotal > (AMOUNT_OF_VISIBLE_PAGES + 1)) {
        arePagesNoLongerAtTheStart = currentPage > MIDDLE_PAGE_NUMBER;
        havePagesReachedTheEnd = currentPage > pagesTotal - MIDDLE_PAGE_NUMBER;

        let startIndex = 0;
        if (arePagesNoLongerAtTheStart) { startIndex = currentPage - MIDDLE_PAGE_NUMBER; }
        if (havePagesReachedTheEnd) { startIndex = pagesTotal - AMOUNT_OF_VISIBLE_PAGES; }

        pagesVisible = slice(pagesAll, startIndex, startIndex + AMOUNT_OF_VISIBLE_PAGES);
    }

    return (
        <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm my-3 justify-content-center flex-wrap">
                <li className={ `page-item ${currentPage <= 1 ? 'disabled' : ''}` }>
                    <button
                        type="button"
                        className="page-link"
                        onClick={ currentPage > 1 ? () => props.onPageClick(currentPage - 1) : () => {} }
                    >
                        Prev
                    </button>
                </li>

                { arePagesNoLongerAtTheStart && (
                    <>
                        <li className="page-item">
                            <button type="button" className="page-link" onClick={ () => props.onPageClick(1) }>1</button>
                        </li>
                        <li className="page-item disabled"><span className="page-link">...</span></li>
                    </>
                )}

                {map(pagesVisible, page => (
                    <li className={ `page-item ${currentPage === page ? 'active' : ''}` } key={ page }>
                        <button
                            type="button"
                            className="page-link"
                            onClick={ () => props.onPageClick(page) }
                        >
                            {page}
                        </button>
                    </li>
                ))}

                { !havePagesReachedTheEnd && (
                    <>
                        <li className="page-item disabled"><span className="page-link">...</span></li>
                        <li className="page-item">
                            <button type="button" className="page-link" onClick={ () => props.onPageClick(pagesTotal) }>{pagesTotal}</button>
                        </li>
                    </>
                )}

                <li className={ `page-item ${currentPage >= pagesTotal ? 'disabled' : ''}` }>
                    <button
                        type="button"
                        className="page-link"
                        onClick={ currentPage < pagesTotal ? () => props.onPageClick(currentPage + 1) : () => {} }
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

Pagination.propTypes = {
    itemsTotal: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    onPageClick: PropTypes.func.isRequired,
};

export const PageInfo = (props) => {
    const { itemsTotal, currentPage, itemsPerPage } = props;

    if (!itemsTotal || !currentPage || !itemsPerPage) return null;

    const start = ((currentPage - 1) * itemsPerPage) + 1;
    const end = currentPage * itemsPerPage;

    return <p className="text-center text-muted font-size-sm my-3">{`${start} to ${end > itemsTotal ? itemsTotal : end} of ${itemsTotal}`}</p>;
};

PageInfo.propTypes = {
    itemsTotal: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
};
