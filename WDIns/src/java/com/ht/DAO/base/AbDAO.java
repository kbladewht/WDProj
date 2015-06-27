package com.ht.DAO.base;

import java.lang.reflect.Field;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.persister.entity.AbstractEntityPersister;

public abstract class AbDAO extends AbstractSuperDAO {

	
	public <E> void batchUpdate(List<E> list, int batchSize) {
		if (list.size() == 0) {
			logger.info("List size is 0, so no need to execute update.");
			return;
		}

		Session session = this.getSessionFactory().openSession();

		try {
			Transaction tx = session.beginTransaction();

			int count = 0;
			for (Object o : list) {
				session.update(o);

				if (++count % batchSize == 0) {
					logger.info("Current Batch updated seq: " + count);
					session.flush();
					session.clear();
				}
			}

			tx.commit();
		} finally {
			session.close();
		}

		logger.info("Done " + list.size() + " rows updated.");
	}

	public <E> void batchSave(List<E> list, int batchSize) {
		try {
			this.batchSaveByHibernateConfigJDBC(list, batchSize);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public <E> void batchUpdate(List<E> list) {

		this.batchUpdate(list, 1000);

	}

	public <E> void batchSave(List<E> list) {

		try {
			this.batchSaveByHibernateConfigJDBC(list);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}

	}

	public int execSQLUpdate(String sql) {

		return this.execSQLUpdate(sql, null);

	}

	public int execSQLUpdate(String sql, Object[] objects) {

		Session s = this.getSessionFactory().getCurrentSession();

		try {
			Query query = s.createSQLQuery(sql);
			this.logger.info(sql);

			this.buildParams(objects, query);

			return query.executeUpdate();
		} finally {
			if (s != null) {
				s.close();
			}
		}

	}
	
	public <E> List<E> getQuery(String sql, Object[] objects) {

		Session s = this.getHSession();

		try {
			Query query = s.createQuery(sql);
			this.logger.info(sql);

			this.buildParams(objects, query);

			@SuppressWarnings("unchecked")
			List<E> l = query.list();

			if (l == null) {
				return new ArrayList<E>();
			}

			return l;

		} finally {
			if (s != null) {
				s.close();
			}
		}

	}


	public <E> List<E> getSQLQueryResults(String sql, ClassEntity... entity) {
		return this.getSQLQueryResults(sql, new Object[] {}, entity);
	}

	@SuppressWarnings("rawtypes")
	public <E> List<E> getSQLQueryResults(String sql, Object[] args, Class clazz) {
		return this.getSQLQueryResults(sql, args, new ClassEntity("", clazz));
	}

	public <E> List<E> getSQLQueryResults(String sql, Object[] args) {
		return this.getSQLQueryResults(sql, args, new ClassEntity[] {});
	}

	@SuppressWarnings("unchecked")
	public <E> List<E> getSQLQueryResults(String sql, Object[] objects, ClassEntity... entities) {
		
		Session s = this.getSessionFactory().openSession();

		try {
			SQLQuery q = s.createSQLQuery(sql);
	
			buildParams(objects, q);
			buildOutput(entities, q);
	
			List<E> l = (List<E>) q.list();
			if (l == null || l.isEmpty()) {
				return Collections.EMPTY_LIST;
			}

			return l;
		} finally {
			s.close();
		}

	}

	@SuppressWarnings("unchecked")
	public <T> T getSQLUniqueResult(String sql) {

		Session s = this.getSessionFactory().openSession();


		try {
			Query q = s.createSQLQuery(sql);
			return (T) q.uniqueResult();

		} finally {

			s.close();

		}

	}
	
	public <E> E getSQLUniqueResult(String sql, Object[] args) {

		List<E> list = this.getSQLQueryResults(sql, args);
		return list.get(0);
	}

	@SuppressWarnings("unchecked")
	public <T> T getSQLQueryResultsUnique(String sql, Object[] objects) {

		Session s = this.getSessionFactory().openSession();

		try {
			SQLQuery q = s.createSQLQuery(sql);
	
			buildParams(objects, q);

		
			return (T) q.uniqueResult();

		} finally {

			s.close();

		}

	}

	public <E> E getResultsUniqueWOError(String sql, Object[] objects) {

		List<E> list = this.getSQLQueryResults(sql, objects);

		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}

	public <E> E getResultsUniqueWOError(String sql, Object[] objects, ClassEntity entity) {

		List<E> list = this.getSQLQueryResults(sql, objects, entity);

		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}

	public List<HTResultSet> querySP(String sql) throws Exception {

		try {
			return _querySP(sql, null);
		} catch (SQLException e) {
			throw new Exception(e);
		}
	}

	public List<HTResultSet> querySP(String sql, Connection conn) throws Exception {

		try {
			return _querySP(sql, conn);
		} catch (SQLException e) {
			throw new Exception(e);
		}
	}

	private List<HTResultSet> _querySP(String sql, Connection connForce) throws SQLException {

		Connection conn = getConnection(connForce);

		CallableStatement callStmt = null;
		ResultSet rs = null;

		try {

			callStmt = conn.prepareCall(sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

			rs = getFollowingRS(callStmt, sql);

			List<HTResultSet> results = new ArrayList<HTResultSet>();
			if (rs == null) {
				return results;
			}

			fillinDataByRS(rs, results);

			return results;

		} finally {
			clearConn(conn, rs, callStmt);
		}
	}

	public <E> void batchSaveByHibernateConfigJDBC(List<E> list) throws Exception {
		this.batchSaveByHibernateConfigJDBC(list, 10000);
	}

	public <E> void batchSaveByHibernateConfigJDBC(List<E> list, int batchSize) throws Exception {

		if (list == null || list.isEmpty()) {
			this.logger.info("List is empty...");
			return;
		}

		List<Field> fieldsList = getTobePersistedFields(list.get(0));
		Connection conn = this.getConnection();
		
		JDBCBuilder builder = new JDBCBuilder(conn, fieldsList, batchSize);

		AbstractEntityPersister entityPersister = getEntityPersister(list);

		try {
			builder.batchInsert(list, entityPersister);
		} catch (Exception e) {
			this.logger.error(e.getMessage(), e);
			throw new Exception(e);
		}

	}
	

}
